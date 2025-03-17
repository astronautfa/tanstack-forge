import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { Button } from "@app/ui/components/button";
import { Alert, AlertDescription } from "@app/ui/components/alert";
import { Input } from "@app/ui/components/input";
import { Label } from "@app/ui/components/label";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { useLogin } from "@/lib/hooks/use-auth";

interface LoginFormProps {
    onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
    const login = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onChange"
    });

    async function onSubmit(data: LoginFormValues) {
        try {
            await login.mutateAsync(data);
            onSuccess?.();
        } catch (error) {
            // Error is handled by the useMutation hook
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {login.error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {login.error instanceof Error
                            ? login.error.message
                            : "Something went wrong. Please try again."}
                    </AlertDescription>
                </Alert>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        autoComplete="email"
                        className={errors.email ? "border-red-300" : ""}
                        {...register("email")}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                            to="/"
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        className={errors.password ? "border-red-300" : ""}
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={login.isPending || !isValid}
                >
                    {login.isPending ? "Signing in..." : "Sign in"}
                </Button>
            </div>
        </form>
    );
}