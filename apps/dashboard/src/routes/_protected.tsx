// src/routes/_protected.tsx
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useSession } from "@/lib/providers/session";

export const Route = createFileRoute("/_protected")({
    beforeLoad: () => {
        // This runs on the server and client
        return {};
    },
    component: ProtectedLayout,
});

function ProtectedLayout() {
    const { user, loaded } = useSession();

    // Show loading state while checking authentication
    if (!loaded) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    // If user is not authenticated, redirect to login
    if (!user) {
        // Store the current path for redirect after login
        if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            sessionStorage.setItem("previousUrl", currentPath);
        }

        return <Navigate to="/auth/signin" />;
    }

    // User is authenticated, render the content
    return <Outlet />;
}