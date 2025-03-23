import { useState, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeftIcon, CheckCircle2, EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@app/ui/components/button";
import { Alert, AlertDescription, AlertTitle } from "@app/ui/components/alert";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/validations/auth";
import { authClient } from "@app/auth/client";
import { Link } from "@tanstack/react-router";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@app/ui/components/form";
import { Input } from "@app/ui/components/input";
import { Label } from "@app/ui/components/label";
import { useSession } from "@/lib/providers/session";

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [serverError, setServerError] = useState<{ title: string; message?: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { user, reloadSession } = useSession();

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
        mode: "onChange"
    });

    async function onSubmit(data: ResetPasswordFormValues) {
        setIsSubmitting(true);

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
            setIsSubmitting(false);
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
                                <FormMessage />
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Resetting..." : "Reset Password"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}