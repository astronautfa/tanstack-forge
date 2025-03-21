import { createFileRoute, Link } from "@tanstack/react-router";
import { LoginForm } from "@/components/auth/login-form";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";

export const Route = createFileRoute("/auth/signin")({
    component: SignInPage,
});

function SignInPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">
                    Sign in to your account
                </h2>
                <p className="text-sm text-muted-foreground">
                    Enter your credentials below to access your account
                </p>
            </div>

            <LoginForm />

            <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account?</span>{" "}
                <Link
                    to="/auth/signup"
                    className="font-medium text-primary hover:underline"
                >
                    Sign up
                </Link>
            </div>

            <SocialAuthButtons type="signin" />
        </div>
    );
}