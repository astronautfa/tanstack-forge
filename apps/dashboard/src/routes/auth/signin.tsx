import { createFileRoute, Link } from "@tanstack/react-router";
import { LoginForm } from "@/components/auth/login-form";

export const Route = createFileRoute("/auth/signin")({
    component: SignInPage,
});

function SignInPage() {
    return (
        <div className="space-y-5">
            <div className="text-center">
                <h2 className="text-lg font-semibold">Welcome back</h2>
                <p className="text-sm text-muted-foreground">
                    Enter your credentials to login to your account.
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
        </div>
    );
}