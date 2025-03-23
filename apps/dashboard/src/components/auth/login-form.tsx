import { useState, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { AlertCircle, EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@app/ui/components/button";
import { Input } from "@app/ui/components/input";
import { Checkbox } from "@app/ui/components/checkbox";
import { Label } from "@app/ui/components/label";
import { Alert, AlertDescription, AlertTitle } from "@app/ui/components/alert";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { authClient } from "@app/auth/client";
import { useSession } from "@/lib/providers/session";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@app/ui/components/form";
import { SocialAuthButtons } from "./social-auth-buttons";

interface LoginFormProps {
    onSuccess?: () => void;
    redirectTo?: string;
    className?: string;
}

export function LoginForm({
    onSuccess,
    redirectTo = "/",
    className = ""
}: LoginFormProps) {
    const id = useId();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const { reloadSession } = useSession();
    const navigate = useNavigate();
    const router = useRouter();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onChange"
    });

    async function onSubmit(data: LoginFormValues) {
        setIsSubmitting(true);

        try {
            const { error } = await authClient.signIn.email({
                email: data.email,
                password: data.password,
            });

            if (error) {
                throw error;
            }

            await reloadSession();
            onSuccess?.();

            await router.invalidate();

            navigate({
                to: redirectTo,
                replace: true
            });
        } catch (error) {
            setServerError("Invalid email or password. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)(e);
                }}
                method="post"
                className={`space-y-5 ${className}`}
            >
                {serverError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Sign in failed</AlertTitle>
                        <AlertDescription>{serverError}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
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
                                        placeholder="hi@yourcompany.com"
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
                                            autoComplete="current-password"
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
                </div>

                <div className="flex justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Checkbox id={`${id}-remember`} />
                        <Label htmlFor={`${id}-remember`} className="text-muted-foreground font-normal">
                            Remember me
                        </Label>
                    </div>
                    <Link
                        to="/auth/forgot-password"
                        className="text-muted-foreground text-sm hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>

                <div className="before:bg-border after:bg-border flex items-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1">
                    <span className="text-muted-foreground text-xs">Or</span>
                </div>

                <SocialAuthButtons type="signin" />
            </form>
        </Form>
    );
}