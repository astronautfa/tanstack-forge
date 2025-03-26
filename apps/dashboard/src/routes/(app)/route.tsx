import { createFileRoute, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@app/ui/components/sidebar";
import { AppSidebar } from "../../components/app-sidebar";
import { authClient } from "@app/auth/client";

export const Route = createFileRoute("/(app)")({
    component: AppLayout,
    loader: ({ context }) => {
        return { user: context.user };
    },
    beforeLoad: async ({ context }) => {
        const { user } = context;
        if (!user) {
            throw redirect({ to: "/auth/signin" });
        }

        // `context.queryClient` is also available in our loaders
        // https://tanstack.com/start/latest/docs/framework/react/examples/start-basic-react-query
        // https://tanstack.com/router/latest/docs/framework/react/guide/external-data-loading
    },
});

function AppLayout() {
    const { queryClient } = Route.useRouteContext();
    // const { user } = Route.useLoaderData();
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

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex h-screen w-full overflow-hidden bg-sidebar">
                <AppSidebar onSignOut={handleSignOut} />
                <SidebarInset className="overflow-auto bg-background text-foreground">
                    <div className="grid gap-6">
                        {/* Dashboard Header */}
                        <div className="flex items-center justify-start gap-2">
                            <SidebarTrigger className="" />
                            <h1 className="text-lg font-semibold tracking-tight text-foreground">Dashboard</h1>
                        </div>
                        <Outlet />
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}