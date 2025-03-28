import { createFileRoute, Link } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

interface ForgotPasswordSearchParams {
    email?: string;
}

export const Route = createFileRoute("/auth/forgot-password")({
    validateSearch: (search): ForgotPasswordSearchParams => {
        return {
            email: search.email as string
        };
    },
    component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
    const { email } = Route.useSearch();

    return (
        <div className="space-y-5">
            <div className="text-center">
                <h2 className="text-lg font-semibold text-foreground">Forgot Password</h2>
                <p className="text-sm text-muted-foreground">
                    Enter your email address and we'll send you a link to reset your password
                </p>
            </div>

            <ForgotPasswordForm defaultEmail={email || ""} />

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