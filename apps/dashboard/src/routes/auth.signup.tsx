import { createFileRoute, Link } from "@tanstack/react-router";
import { RegisterForm } from "@/components/auth/register-form";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";

export const Route = createFileRoute("/auth/signup")({
    component: SignUpPage,
});

function SignUpPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">
                    Create your account
                </h2>
                <p className="text-sm text-muted-foreground">
                    Fill in the details below to create a new account
                </p>
            </div>

            <RegisterForm />

            <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account?</span>{" "}
                <Link
                    to="/auth/signin"
                    className="font-medium text-primary hover:underline"
                >
                    Sign in
                </Link>
            </div>

            <SocialAuthButtons type="signup" />
        </div>
    );
}