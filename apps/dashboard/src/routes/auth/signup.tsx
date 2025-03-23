import { createFileRoute, Link } from "@tanstack/react-router";
import { RegisterForm } from "@/components/auth/register-form";

export const Route = createFileRoute("/auth/signup")({
    component: SignUpPage,
});

function SignUpPage() {
    return (
        <div className="space-y-5">
            <div className="text-center">
                <h2 className="text-lg font-semibold text-foreground">Create your account</h2>
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
        </div>
    );
}