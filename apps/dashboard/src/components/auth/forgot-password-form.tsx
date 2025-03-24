import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeftIcon, Mail } from "lucide-react";
import { Button } from "@app/ui/components/button";
import { Alert, AlertDescription, AlertTitle } from "@app/ui/components/alert";
import { Input } from "@app/ui/components/input";
import { Label } from "@app/ui/components/label";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validations/auth";
import { authClient } from "@app/auth/client";
import { Link } from "@tanstack/react-router";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@app/ui/components/form";
import { useAuth } from "@/routes/auth/route";

interface ForgotPasswordFormProps {
    onSuccess?: () => void;
    className?: string;
    defaultEmail?: string;
}

export function ForgotPasswordForm({
    onSuccess,
    className = "",
    defaultEmail = ""
}: ForgotPasswordFormProps) {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [serverError, setServerError] = useState<{ title: string; message?: string } | null>(null);

    const { isLoading, setIsLoading } = useAuth();

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: defaultEmail,
        },
        mode: "onChange"
    });

    useEffect(() => {
        if (defaultEmail) {
            form.setValue("email", defaultEmail);
        }
    }, [defaultEmail, form]);

    const email = form.watch("email");

    const hasEmailValue = !!email;

    const isFormValid = form.formState.isValid;

    async function onSubmit(data: ForgotPasswordFormValues) {
        setIsLoading(true);

        try {
            const redirectTo = new URL(
                "/auth/reset-password",
                window.location.origin
            ).toString();

            const { error } = await authClient.forgetPassword({
                email: data.email,
                redirectTo,
            });

            if (error) {
                throw error;
            }

            setIsSubmitted(true);
            onSuccess?.();
        } catch (error) {
            setServerError({
                title: "Password reset link could not be sent",
                message: "We couldn't send a password reset link to that email. Please check the email address and try again."
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (isSubmitted) {
        return (
            <div className={`space-y-4 ${className}`}>
                <Alert variant="success">
                    <Mail className="h-4 w-4" />
                    <AlertTitle>Check your email</AlertTitle>
                    <AlertDescription>
                        Password reset instructions have been sent to your email.
                    </AlertDescription>
                </Alert>
                <Button asChild className="w-full mt-4 group">
                    <Link to="/auth/signin">
                        <ArrowLeftIcon
                            className="ms-0 opacity-60 transition-transform group-hover:-translate-x-1"
                            size={16}
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                        Return to Sign In
                    </Link>
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
                className={`space-y-5 ${className}`}>
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
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <Label htmlFor="email">Email</Label>
                                <FormControl>
                                    <Input
                                        id="email"
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

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || !hasEmailValue || !isFormValid}
                    >
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}