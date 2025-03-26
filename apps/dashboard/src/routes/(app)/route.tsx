import { createFileRoute, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@app/ui/components/sidebar";
import { AppSidebar } from "../../components/app-sidebar"; // Adjust path
import { authClient } from "@app/auth/client";

export const Route = createFileRoute("/(app)")({
    component: AppLayout,
    loader: ({ context }) => {
        // Ensure the user type matches what you expect
        const user = context.user;
        return { user };
    },
    beforeLoad: async ({ context }) => {
        const { user } = context;
        if (!user) {
            throw redirect({ to: "/auth/signin" }); // Make sure this route exists
        }
        // Return or resolve void is fine here if no other data needed
    },
    // Make sure queryClient is available in context if you use useRouteContext
    // Usually set up when creating the router instance
});

function AppLayout() {
    // --- Get data/context HERE ---
    const { queryClient } = Route.useRouteContext(); // Get queryClient if needed here
    const { user } = Route.useLoaderData();        // Get user from loader
    const router = useRouter();                     // Get router instance

    // --- Define handlers HERE ---
    const handleSignOut = async () => {
        try {
            await authClient.signOut();
            // Adjust queryKey if needed
            await queryClient.invalidateQueries({ queryKey: ["user"] });
            await router.invalidate(); // Re-runs loaders/beforeLoad
        } catch (error) {
            console.error("Sign out failed:", error);
        }
    };

    // user should be guaranteed non-null because of beforeLoad
    if (!user) return null; // Or a loading/error state, though beforeLoad handles redirect

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex h-screen w-full overflow-hidden bg-sidebar">
                {/* --- Pass data/handlers down --- */}
                <AppSidebar user={user} onSignOut={handleSignOut} />
                <SidebarInset className="overflow-auto bg-background text-foreground">
                    <div className="flex items-center justify-start gap-2 border-b p-4"> {/* Example header */}
                        <SidebarTrigger className="text-muted-foreground" />
                        <h1 className="text-lg font-semibold tracking-tight text-foreground">Dashboard</h1>
                    </div>
                    <div className="p-4"> {/* Padding for content area */}
                        <Outlet />
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}