import { useState, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, EyeIcon, EyeOffIcon, Mail } from "lucide-react";
import { Button } from "@app/ui/components/button";
import { Alert, AlertDescription, AlertTitle } from "@app/ui/components/alert";
import { Checkbox } from "@app/ui/components/checkbox";
import { Label } from "@app/ui/components/label";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";
import { authClient } from "@app/auth/client";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@app/ui/components/form";
import { Input } from "@app/ui/components/input";
import { SocialAuthButtons } from "./social-auth-buttons";

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    async function onSubmit(data: RegisterFormValues) {
        setIsSubmitting(true);

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
            setIsSubmitting(false);
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
                                <FormMessage />
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
                                <FormMessage />
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
                                <FormMessage />
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating account..." : "Sign up"}
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