import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
    component: AuthLayout,
});

function AuthLayout() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="p-8 shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}