import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeftIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@app/ui/components/button";
import { Alert, AlertDescription, AlertTitle } from "@app/ui/components/alert";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/validations/auth";
import { authClient } from "@app/auth";
import { Link } from "@tanstack/react-router";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@app/ui/components/form";
import { Input } from "@app/ui/components/input";
import { useSession } from "@/lib/providers/session";

interface ResetPasswordFormProps {
    onSuccess?: () => void;
    redirectTo?: string;
}

export function ResetPasswordForm({ onSuccess, redirectTo = "/" }: ResetPasswordFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [serverError, setServerError] = useState<{ title: string; message?: string } | null>(null);
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
            <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Password reset successful</AlertTitle>
                    <AlertDescription>
                        Your password has been reset successfully. You can now sign in with your new password.
                    </AlertDescription>
                </Alert>
                <Button asChild className="w-full mt-4">
                    <Link to="/auth/login">Return to Sign In</Link>
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
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="password"
                                        autoComplete="new-password"
                                    />
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
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="password"
                                        autoComplete="new-password"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                    // loading={isSubmitting}
                    >
                        {isSubmitting ? "Resetting..." : "Reset Password"}
                    </Button>
                </div>
            </form>

            <div className="mt-6 text-center text-sm">
                <Link to="/auth/login" className="text-primary hover:underline">
                    <ArrowLeftIcon className="mr-1 inline h-4 w-4 align-middle" />
                    Back to Sign In
                </Link>
            </div>
        </Form>
    );
}