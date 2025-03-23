import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, ArrowLeftIcon } from "lucide-react";
import { Button } from "@app/ui/components/button";
import { Alert, AlertDescription, AlertTitle } from "@app/ui/components/alert";
import { Input } from "@app/ui/components/input";
import { Label } from "@app/ui/components/label";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validations/auth";
import { authClient } from "@app/auth/client";
import { Link } from "@tanstack/react-router";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@app/ui/components/form";

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [serverError, setServerError] = useState<{ title: string; message?: string } | null>(null);

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: defaultEmail,
        },
        mode: "onChange"
    });

    // Update form values when defaultEmail prop changes
    useEffect(() => {
        if (defaultEmail) {
            form.setValue("email", defaultEmail);
        }
    }, [defaultEmail, form]);

    // Watch for email value to determine if button should be enabled
    const email = form.watch("email");

    // Check if email field has a value
    const hasEmailValue = !!email;

    // Check if form passes validation
    const isFormValid = form.formState.isValid;

    async function onSubmit(data: ForgotPasswordFormValues) {
        setIsSubmitting(true);

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
            setIsSubmitting(false);
        }
    }

    if (isSubmitted) {
        return (
            <div className={`space-y-4 ${className}`}>
                <Alert className="bg-green-50 border-green-200 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Check your email</AlertTitle>
                    <AlertDescription>
                        Password reset instructions have been sent to your email.
                    </AlertDescription>
                </Alert>
                <p className="text-sm text-muted-foreground">
                    Please check your inbox and follow the instructions to reset your password.
                </p>
                <Button asChild className="w-full mt-4">
                    <Link to="/auth/signin">
                        <ArrowLeftIcon className="mr-1 h-4 w-4" />
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
                        disabled={isSubmitting || !hasEmailValue || !isFormValid}
                    >
                        {isSubmitting ? "Sending..." : "Send Reset Link"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}