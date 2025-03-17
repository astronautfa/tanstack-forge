import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
    component: AuthLayout,
});

function AuthLayout() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Welcome to the App
                    </h1>
                </div>
                <div className="bg-white p-8 shadow-md rounded-lg">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}