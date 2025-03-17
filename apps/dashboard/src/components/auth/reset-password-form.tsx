import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { Button } from "@app/ui/components/button";
import { Alert, AlertDescription } from "@app/ui/components/alert";
import { FormField } from "@app/ui/components/form-field";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/validations/auth";
import { useResetPassword } from "@/lib/hooks/use-auth";

interface ResetPasswordFormProps {
    token: string;
    onSuccess?: () => void;
}

export function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
    const resetPassword = useResetPassword();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
        mode: "onChange"
    });

    async function onSubmit(data: ResetPasswordFormValues) {
        try {
            await resetPassword.mutateAsync({ ...data, token });
            onSuccess?.();
        } catch (error) {
            // Error is handled by the useMutation hook
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {resetPassword.error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {resetPassword.error instanceof Error
                            ? resetPassword.error.message
                            : "Something went wrong. Please try again."}
                    </AlertDescription>
                </Alert>
            )}

            <div className="space-y-4">
                <FormField
                    id="password"
                    label="New Password"
                    type="password"
                    autoComplete="new-password"
                    error={errors.password}
                    registerProps={register("password")}
                />

                <FormField
                    id="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    autoComplete="new-password"
                    error={errors.confirmPassword}
                    registerProps={register("confirmPassword")}
                />

                <Button
                    type="submit"
                    className="w-full"
                    disabled={resetPassword.isPending || !isValid}
                >
                    {resetPassword.isPending ? "Resetting..." : "Reset Password"}
                </Button>
            </div>
        </form>
    );
}