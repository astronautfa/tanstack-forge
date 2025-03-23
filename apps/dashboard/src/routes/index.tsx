import { createFileRoute, redirect } from "@tanstack/react-router";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
    SidebarTrigger
} from "@app/ui/components/sidebar";
import {
    LayoutDashboard,
    User,
    Settings,
    PieChart,
    Calendar,
    MessageSquare,
    FileText,
    HelpCircle
} from "lucide-react";

export const Route = createFileRoute("/")({
    component: Dashboard,
    beforeLoad: ({ context }) => {
        const { user } = context;

        if (!user) {
            throw redirect({
                to: '/auth/signin',
                replace: true,
            });
        }
    },
});

function Dashboard() {
    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex h-screen w-full overflow-hidden">
                <Sidebar>
                    <SidebarHeader>
                        <div className="flex items-center gap-2 px-2">
                            <SidebarTrigger />
                            <h1 className="text-xl font-bold">Dashboard</h1>
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton isActive={true} tooltip="Dashboard">
                                            <LayoutDashboard />
                                            <span>Dashboard</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>

                                    <SidebarMenuItem>
                                        <SidebarMenuButton tooltip="Analytics">
                                            <PieChart />
                                            <span>Analytics</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>

                                    <SidebarMenuItem>
                                        <SidebarMenuButton tooltip="Calendar">
                                            <Calendar />
                                            <span>Calendar</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>

                                    <SidebarMenuItem>
                                        <SidebarMenuButton tooltip="Messages">
                                            <MessageSquare />
                                            <span>Messages</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarGroup>
                            <SidebarGroupLabel>User</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton tooltip="Profile">
                                            <User />
                                            <span>Profile</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>

                                    <SidebarMenuItem>
                                        <SidebarMenuButton tooltip="Documents">
                                            <FileText />
                                            <span>Documents</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarGroup>
                            <SidebarGroupLabel>System</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton tooltip="Settings">
                                            <Settings />
                                            <span>Settings</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>

                                    <SidebarMenuItem>
                                        <SidebarMenuButton tooltip="Help">
                                            <HelpCircle />
                                            <span>Help & Support</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>

                <main className="flex-1 overflow-auto bg-background p-6">
                    <div className="grid gap-6">
                        {/* Dashboard Header */}
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                            <div className="flex items-center gap-2">
                                {/* You can add user profile button/notification icons here */}
                            </div>
                        </div>

                        {/* Overview Cards */}
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Card 1 */}
                            <div className="rounded-lg border bg-card p-6 shadow-sm">
                                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <h3 className="text-sm font-medium tracking-tight">Total Revenue</h3>
                                    <PieChart className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="text-2xl font-bold">$45,231.89</div>
                                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                            </div>

                            {/* Card 2 */}
                            <div className="rounded-lg border bg-card p-6 shadow-sm">
                                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <h3 className="text-sm font-medium tracking-tight">Subscriptions</h3>
                                    <User className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="text-2xl font-bold">+2,350</div>
                                <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                            </div>

                            {/* Card 3 */}
                            <div className="rounded-lg border bg-card p-6 shadow-sm">
                                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <h3 className="text-sm font-medium tracking-tight">Active Users</h3>
                                    <User className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="text-2xl font-bold">+12,234</div>
                                <p className="text-xs text-muted-foreground">+19% from last month</p>
                            </div>

                            {/* Card 4 */}
                            <div className="rounded-lg border bg-card p-6 shadow-sm">
                                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <h3 className="text-sm font-medium tracking-tight">Active Now</h3>
                                    <User className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="text-2xl font-bold">+573</div>
                                <p className="text-xs text-muted-foreground">+201 since last hour</p>
                            </div>
                        </div>

                        {/* Main Content Section */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                            {/* Left Section - Recent Activity (Spans 4 columns) */}
                            <div className="col-span-full rounded-lg border bg-card p-6 shadow-sm lg:col-span-4">
                                <h3 className="mb-4 text-lg font-medium">Recent Activity</h3>
                                <div className="space-y-4">
                                    {/* Activity Items */}
                                    {[1, 2, 3, 4, 5].map((item) => (
                                        <div key={item} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                                            <div className="h-8 w-8 rounded-full bg-muted" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">User updated their profile</p>
                                                <p className="text-xs text-muted-foreground">2 hours ago</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Section - Upcoming Events (Spans 3 columns) */}
                            <div className="col-span-full rounded-lg border bg-card p-6 shadow-sm lg:col-span-3">
                                <h3 className="mb-4 text-lg font-medium">Upcoming Events</h3>
                                <div className="space-y-4">
                                    {/* Event Items */}
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Team Meeting</p>
                                                <p className="text-xs text-muted-foreground">Mar 20, 2025 • 10:00 AM</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}