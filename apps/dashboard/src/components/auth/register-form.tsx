import { useState, useId, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, EyeIcon, EyeOffIcon, Mail, Check, X } from "lucide-react";
import { Button } from "@app/ui/components/button";
import { Alert, AlertDescription, AlertTitle } from "@app/ui/components/alert";
import { Label } from "@app/ui/components/label";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";
import { authClient } from "@app/auth/client";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@app/ui/components/form";
import { Input } from "@app/ui/components/input";
import { SocialAuthButtons } from "./social-auth-buttons";
import { useAuth } from "@/routes/auth/route";

interface RegisterFormProps {
    onSuccess?: () => void;
    redirectTo?: string;
    className?: string;
}

export function RegisterForm({
    onSuccess,
    redirectTo = "/",
    className = ""
}: RegisterFormProps) {
    const id = useId();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { isLoading, setIsLoading } = useAuth();

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        mode: "onChange"
    });

    const passwordRequirements = [
        { regex: /.{8,}/, text: "At least 8 characters" },
        { regex: /[0-9]/, text: "At least 1 number" },
        { regex: /[a-z]/, text: "At least 1 lowercase letter" },
        { regex: /[A-Z]/, text: "At least 1 uppercase letter" }
    ];

    const password = form.watch("password");

    const requirementStatus = useMemo(() => {
        return passwordRequirements.map((req) => ({
            met: req.regex.test(password || ""),
            text: req.text,
        }));
    }, [password]);

    const confirmPassword = form.watch("confirmPassword");
    const passwordsMatch = password === confirmPassword && password !== "";

    const isFormValid = form.formState.isValid;

    async function onSubmit(data: RegisterFormValues) {
        setIsLoading(true);

        try {
            const callbackURL = new URL(
                redirectTo,
                window.location.origin
            ).toString();

            const { error } = await authClient.signUp.email({
                name: data.name,
                email: data.email,
                password: data.password,
                callbackURL,
            });

            if (error) {
                throw error;
            }

            setIsSubmitted(true);
            onSuccess?.();
        } catch (error) {
            setServerError(
                error instanceof Error
                    ? error.message
                    : "Failed to create account. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    }

    if (isSubmitted) {
        return (
            <Alert variant="success">
                <Mail className="h-5 w-5" />
                <AlertTitle>Verify your email</AlertTitle>
                <AlertDescription>
                    We've sent you an email with a link to verify your account. Please check your inbox and follow the instructions.
                </AlertDescription>
            </Alert>
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
                className={`space-y-5 ${className}`}>
                {serverError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Registration failed</AlertTitle>
                        <AlertDescription>{serverError}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <Label htmlFor={`${id}-name`}>Full Name</Label>
                                <FormControl>
                                    <Input
                                        id={`${id}-name`}
                                        {...field}
                                        placeholder="John Doe"
                                        autoComplete="name"
                                    />
                                </FormControl>
                                {form.formState.submitCount > 0 && <FormMessage />}
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <Label htmlFor={`${id}-email`}>Email</Label>
                                <FormControl>
                                    <Input
                                        id={`${id}-email`}
                                        {...field}
                                        type="email"
                                        placeholder="hi@example.com"
                                        autoComplete="email"
                                    />
                                </FormControl>
                                {form.formState.submitCount > 0 && <FormMessage />}
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <Label htmlFor={`${id}-password`}>Password</Label>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            id={`${id}-password`}
                                            {...field}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
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
                                            <li key={index} className="flex items-center gap-1.5">
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
                            <FormItem>
                                <Label htmlFor={`${id}-confirm-password`}>Confirm Password</Label>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            id={`${id}-confirm-password`}
                                            {...field}
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm your password"
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
                                    <div className="mt-2 flex items-center gap-1">
                                        {passwordsMatch ? (
                                            <>
                                                <Check size={16} className="text-emerald-500" aria-hidden="true" />
                                                <span className="text-xs text-emerald-600">Passwords match</span>
                                            </>
                                        ) : (
                                            <>
                                                <X size={16} className="text-destructive/80" aria-hidden="true" />
                                                <span className="text-xs text-destructive">Passwords do not match</span>
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
                        {isLoading ? "Creating account..." : "Sign up"}
                    </Button>
                </div>

                <div className="before:bg-border after:bg-border flex items-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1">
                    <span className="text-muted-foreground text-xs">Or</span>
                </div>

                <SocialAuthButtons type='signup' />
            </form>
        </Form>
    );
}