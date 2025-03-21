import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, ArrowLeftIcon } from "lucide-react";
import { Button } from "@app/ui/components/button";
import { Alert, AlertDescription, AlertTitle } from "@app/ui/components/alert";
import { FormField } from "@app/ui/components/form-field";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validations/auth";
import { authClient } from "@app/auth";
import { Link } from "@tanstack/react-router";

interface ForgotPasswordFormProps {
    onSuccess?: () => void;
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [serverError, setServerError] = useState<{ title: string; message?: string } | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
        mode: "onChange"
    });

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
            <div className="space-y-4">
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
                    <Link to="/auth/login">
                        <ArrowLeftIcon className="mr-1 h-4 w-4" />
                        Return to Sign In
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(onSubmit)(e);
            }}
            className="space-y-6">
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
                    id="email"
                    label="Email"
                    type="email"
                    placeholder="m@example.com"
                    autoComplete="email"
                    error={errors.email}
                    registerProps={register("email")}
                />

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>
            </div>

            <div className="mt-6 text-center text-sm">
                <Link to="/auth/login" className="text-primary hover:underline">
                    <ArrowLeftIcon className="mr-1 inline h-4 w-4 align-middle" />
                    Back to Sign In
                </Link>
            </div>
        </form>
    );
}