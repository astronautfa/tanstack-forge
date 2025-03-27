import { createFileRoute, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@app/ui/components/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { authClient } from "@app/auth/client";

export const Route = createFileRoute("/(app)")({
    component: AppLayout,
    loader: ({ context }) => {
        const user = context.user;
        return { user };
    },
    beforeLoad: async ({ context }) => {
        const { user } = context;
        if (!user) {
            throw redirect({ to: "/auth/signin" });
        }
    },
});

function AppLayout() {
    const { queryClient } = Route.useRouteContext();
    const { user } = Route.useLoaderData();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await authClient.signOut();
            await queryClient.invalidateQueries({ queryKey: ["user"] });
            await router.invalidate();
        } catch (error) {
            console.error("Sign out failed:", error);
        }
    };

    if (!user) return null;

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex h-screen w-full overflow-hidden bg-sidebar">
                <AppSidebar user={user} onSignOut={handleSignOut} />
                <SidebarInset className="overflow-auto bg-background text-foreground">
                    <Outlet />
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}