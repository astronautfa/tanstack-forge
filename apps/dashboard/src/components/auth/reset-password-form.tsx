import { useState, useId, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, EyeIcon, EyeOffIcon, Check, X } from "lucide-react";
import { Button } from "@app/ui/components/button";
import { Alert, AlertDescription, AlertTitle } from "@app/ui/components/alert";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/validations/auth";
import { authClient } from "@app/auth/client";
import { Link } from "@tanstack/react-router";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@app/ui/components/form";
import { Input } from "@app/ui/components/input";
import { Label } from "@app/ui/components/label";
import { useSession } from "@/lib/providers/session";
import { useAuth } from "@/routes/auth/route";

interface ResetPasswordFormProps {
    onSuccess?: () => void;
    redirectTo?: string;
    className?: string;
}

export function ResetPasswordForm({
    onSuccess,
    redirectTo = "/",
    className = ""
}: ResetPasswordFormProps) {
    const id = useId();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [serverError, setServerError] = useState<{ title: string; message?: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { user, reloadSession } = useSession();

    const { isLoading, setIsLoading } = useAuth();

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
        mode: "onChange"
    });

    // Password requirements based on your zod validation
    const passwordRequirements = [
        { regex: /.{8,}/, text: "At least 8 characters" },
        { regex: /[0-9]/, text: "At least 1 number" },
        { regex: /[a-z]/, text: "At least 1 lowercase letter" },
        { regex: /[A-Z]/, text: "At least 1 uppercase letter" }
    ];

    const password = form.watch("password");

    // Check which requirements are met
    const requirementStatus = useMemo(() => {
        return passwordRequirements.map((req) => ({
            met: req.regex.test(password || ""),
            text: req.text,
        }));
    }, [password]);

    // Check if confirm password matches
    const confirmPassword = form.watch("confirmPassword");
    const passwordsMatch = password === confirmPassword && password !== "";

    // Check if form is valid
    const isFormValid = form.formState.isValid;

    async function onSubmit(data: ResetPasswordFormValues) {
        setIsLoading(true);

        try {
            const { error } = await authClient.resetPassword({
                newPassword: data.password,
            });

            if (error) {
                throw error;
            }

            setIsSubmitted(true);
            onSuccess?.();

            // Reload the session to update the user state
            await reloadSession();

            // If user is already authenticated, redirect to the specified path
            if (user) {
                window.location.href = redirectTo;
            }
        } catch (error) {
            setServerError({
                title: "Password reset failed",
                message: error instanceof Error
                    ? error.message
                    : "Failed to reset password. Please try again."
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (isSubmitted) {
        return (
            <div className={`space-y-4 ${className}`}>
                <Alert className="bg-green-50 border-green-200 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Password reset successful</AlertTitle>
                    <AlertDescription>
                        Your password has been reset successfully. You can now sign in with your new password.
                    </AlertDescription>
                </Alert>
                <Button asChild className="w-full mt-4">
                    <Link to="/auth/signin">Return to Sign In</Link>
                </Button>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)(e);
                }}
                method="post"
                className={`space-y-5 ${className}`}
            >
                {serverError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{serverError.title}</AlertTitle>
                        {serverError.message && (
                            <AlertDescription>{serverError.message}</AlertDescription>
                        )}
                    </Alert>
                )}

                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem >
                                <Label htmlFor={`${id}-password`}>New Password</Label>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            id={`${id}-password`}
                                            {...field}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your new password"
                                            autoComplete="new-password"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary"
                                        >
                                            {showPassword ? (
                                                <EyeOffIcon className="h-4 w-4" />
                                            ) : (
                                                <EyeIcon className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>

                                {/* Password requirements checklist */}
                                {password && (
                                    <ul className="mt-2 space-y-1" aria-label="Password requirements">
                                        {requirementStatus.map((req, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                {req.met ? (
                                                    <Check size={16} className="text-emerald-500" aria-hidden="true" />
                                                ) : (
                                                    <X size={16} className="text-muted-foreground/80" aria-hidden="true" />
                                                )}
                                                <span className={`text-xs ${req.met ? "text-emerald-600" : "text-muted-foreground"}`}>
                                                    {req.text}
                                                    <span className="sr-only">
                                                        {req.met ? " - Requirement met" : " - Requirement not met"}
                                                    </span>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {form.formState.submitCount > 0 && <FormMessage />}
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem >
                                <Label htmlFor={`${id}-confirm-password`}>Confirm Password</Label>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            id={`${id}-confirm-password`}
                                            {...field}
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm your new password"
                                            autoComplete="new-password"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOffIcon className="h-4 w-4" />
                                            ) : (
                                                <EyeIcon className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>

                                {/* Show password match status only when both fields have values */}
                                {password && confirmPassword && (
                                    <div className="mt-2 flex items-center gap-2">
                                        {passwordsMatch ? (
                                            <>
                                                <Check size={16} className="text-emerald-500" aria-hidden="true" />
                                                <span className="text-xs text-emerald-600">Passwords match</span>
                                            </>
                                        ) : (
                                            <>
                                                <X size={16} className="text-muted-foreground/80" aria-hidden="true" />
                                                <span className="text-xs text-muted-foreground">Passwords do not match</span>
                                            </>
                                        )}
                                    </div>
                                )}

                                {form.formState.submitCount > 0 && <FormMessage />}
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || !isFormValid}
                    >
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}