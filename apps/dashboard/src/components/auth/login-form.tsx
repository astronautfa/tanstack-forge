import { useState, useId, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { AlertCircle, EyeIcon, EyeOffIcon, KeyRound } from "lucide-react";
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
import { useAuth } from "@/routes/auth/route";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@app/ui/components/dialog";

interface LoginFormProps {
    onSuccess?: () => void;
    redirectTo?: string;
    className?: string;
    onForgotPassword?: (email: string) => void;
}

export function LoginForm({
    onSuccess,
    redirectTo = "/",
    className = "",
    onForgotPassword
}: LoginFormProps) {
    const id = useId();
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const { reloadSession } = useSession();
    const navigate = useNavigate();
    const router = useRouter();

    const { isLoading, setIsLoading } = useAuth();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onChange"
    });

    const email = form.watch("email");
    const password = form.watch("password");

    useEffect(() => {
        setFailedAttempts(0);
    }, [email]);

    const formHasValues = !!email && !!password;

    const isFormValid = form.formState.isValid;

    const handleForgotPasswordClick = () => {
        if (onForgotPassword && email) {
            onForgotPassword(email);
        } else {
            navigate({ to: "/auth/forgot-password" });
        }
    };

    const handleResetPasswordClick = () => {
        setShowResetDialog(false);
        handleForgotPasswordClick();
    };

    async function onSubmit(data: LoginFormValues) {
        setIsLoading(true);

        try {
            const { error } = await authClient.signIn.email({
                email: data.email,
                password: data.password,
            });

            if (error) {
                throw error;
            }

            setFailedAttempts(0);
            await reloadSession();
            onSuccess?.();
            await router.invalidate();
            navigate({
                to: redirectTo,
                replace: true
            });
        } catch (error) {
            const newAttemptCount = failedAttempts + 1;
            setFailedAttempts(newAttemptCount);

            setServerError("Invalid email or password. Please try again.");

            if (newAttemptCount >= 3) {
                setShowResetDialog(true);
            }
        } finally {
            setIsLoading(false); // End loading animation
        }
    }

    return (
        <>
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
                                    {form.formState.submitCount > 0 && <FormMessage />}
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
                                    {form.formState.submitCount > 0 && <FormMessage />}
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
                        <button
                            type="button"
                            onClick={handleForgotPasswordClick}
                            className="text-muted-foreground text-sm hover:underline"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || !formHasValues || !isFormValid}
                    >
                        {isLoading ? "Signing in..." : "Sign in"}
                    </Button>

                    <div className="before:bg-border after:bg-border flex items-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1">
                        <span className="text-muted-foreground text-xs">Or</span>
                    </div>

                    <SocialAuthButtons type="signin" />
                </form>
            </Form>

            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-primary" />
                            <span>Having trouble signing in?</span>
                        </DialogTitle>
                        <DialogDescription>
                            You've made multiple unsuccessful login attempts. Would you like to reset your password?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-secondary/50 p-4 rounded-lg my-2">
                        <p className="text-sm">
                            We'll send a password reset link to <strong>{email}</strong> where you can create a new password.
                        </p>
                    </div>

                    <DialogFooter className="sm:justify-between flex-row gap-2 mt-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowResetDialog(false)}
                        >
                            Try again
                        </Button>
                        <Button
                            variant={'default'}
                            onClick={handleResetPasswordClick}
                        >
                            Reset password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}