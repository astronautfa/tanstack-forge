import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { Button } from "@app/ui/components/button";
import { Alert, AlertDescription } from "@app/ui/components/alert";
import { FormField } from "@app/ui/components/form-field";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";
import { useRegister } from "@/lib/hooks/use-auth";

interface RegisterFormProps {
    onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
    const register = useRegister();

    const {
        register: registerField,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm<RegisterFormValues>({
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
        try {
            await register.mutateAsync(data);
            onSuccess?.();
        } catch (error) {
            // Error is handled by the useMutation hook
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {register.error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {register.error instanceof Error
                            ? register.error.message
                            : "Something went wrong. Please try again."}
                    </AlertDescription>
                </Alert>
            )}

            <div className="space-y-4">
                <FormField
                    id="name"
                    label="Full Name"
                    placeholder="John Doe"
                    autoComplete="name"
                    error={errors.name}
                    registerProps={registerField("name")}
                />

                <FormField
                    id="email"
                    label="Email"
                    type="email"
                    placeholder="m@example.com"
                    autoComplete="email"
                    error={errors.email}
                    registerProps={registerField("email")}
                />

                <FormField
                    id="password"
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    error={errors.password}
                    registerProps={registerField("password")}
                />

                <FormField
                    id="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    autoComplete="new-password"
                    error={errors.confirmPassword}
                    registerProps={registerField("confirmPassword")}
                />

                <Button
                    type="submit"
                    className="w-full"
                    disabled={register.isPending || !isValid}
                >
                    {register.isPending ? "Creating account..." : "Sign up"}
                </Button>
            </div>
        </form>
    );
}