import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@app/ui/components/button";
import { Alert, AlertDescription } from "@app/ui/components/alert";
import { FormField } from "@app/ui/components/form-field";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validations/auth";
import { useForgotPassword } from "@/lib/hooks/use-auth";
import { Link } from "@tanstack/react-router";

interface ForgotPasswordFormProps {
    onSuccess?: () => void;
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const forgotPassword = useForgotPassword();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
        mode: "onChange"
    });

    async function onSubmit(data: ForgotPasswordFormValues) {
        try {
            await forgotPassword.mutateAsync(data);
            setIsSubmitted(true);
            onSuccess?.();
        } catch (error) {
            // Error is handled by the useMutation hook
        }
    }

    if (isSubmitted) {
        return (
            <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                        Password reset instructions have been sent to your email.
                    </AlertDescription>
                </Alert>
                <p className="text-sm text-muted-foreground">
                    Please check your inbox and follow the instructions to reset your password.
                </p>
                <Button asChild className="w-full mt-4">
                    <Link to="/">Return to Sign In</Link>
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {forgotPassword.error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {forgotPassword.error instanceof Error
                            ? forgotPassword.error.message
                            : "Something went wrong. Please try again."}
                    </AlertDescription>
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
                    disabled={forgotPassword.isPending || !isValid}
                >
                    {forgotPassword.isPending ? "Sending..." : "Send Reset Link"}
                </Button>
            </div>
        </form>
    );
}