import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

interface ResetPasswordSearchParams {
    token?: string;
}

export const Route = createFileRoute("/auth/reset-password")({
    validateSearch: (search): ResetPasswordSearchParams => {
        return {
            token: search.token as string
        };
    },
    beforeLoad: ({ search }) => {
        if (!search.token) {
            throw redirect({
                to: "/auth/forgot-password",
            });
        }
    },
    component: ResetPasswordPage,
});

function ResetPasswordPage() {
    return (
        <div className="space-y-5">
            <div className="text-center">
                <h2 className="text-lg font-semibold text-foreground">Reset Your Password</h2>
                <p className="text-sm text-muted-foreground">
                    Create a new password for your account
                </p>
            </div>

            <ResetPasswordForm />

            <div className="text-center text-sm">
                <span className="text-muted-foreground">Remember your password?</span>{" "}
                <Link
                    to="/auth/signin"
                    className="font-medium text-primary hover:underline"
                >
                    Back to sign in
                </Link>
            </div>
        </div>
    );
}