import * as React from "react";

import { SearchForm } from "./search-form";
import { TeamSwitcher } from "./team-switcher";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@app/ui/components/sidebar";
import {
    LayoutDashboard,
    BarChart2,
    Users,
    Code,
    Link,
    Leaf,
    Settings,
    HelpCircle,
    LogOut,
} from "lucide-react";

// This is sample data.
const data = {
    teams: [
        {
            name: "InnovaCraft",
            logo: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741345507/logo-01_kp2j8x.png",
        },
        {
            name: "Acme Corp.",
            logo: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741345507/logo-01_kp2j8x.png",
        },
        {
            name: "Evil Corp.",
            logo: "https://res.cloudinary.com/dlzlfasou/image/upload/v1741345507/logo-01_kp2j8x.png",
        },
    ],
    navMain: [
        {
            title: "Sections",
            url: "#",
            items: [
                {
                    title: "Dashboard",
                    url: "/",
                    icon: LayoutDashboard,
                    isActive: true,
                },
                {
                    title: "Insights",
                    url: "/insights",
                    icon: BarChart2,
                },
                {
                    title: "Contacts",
                    url: "/contacts",
                    icon: Users,
                },
                {
                    title: "Tools",
                    url: "/tools",
                    icon: Code,
                },
                {
                    title: "Integration",
                    url: "/integration",
                    icon: Link,
                },
                {
                    title: "Layouts",
                    url: "/layouts",
                    icon: Link,
                },
                {
                    title: "Reports",
                    url: "/reports",
                    icon: Leaf,
                },
            ],
        },
        {
            title: "Other",
            url: "#",
            items: [
                {
                    title: "Settings",
                    url: "/settings",
                    icon: Settings,
                },
                {
                    title: "Help Center",
                    url: "/help",
                    icon: HelpCircle,
                },
            ],
        },
    ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    onSignOut?: () => Promise<void> | void;
}

export function AppSidebar({ onSignOut, ...props }: AppSidebarProps) {
    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={data.teams} />
                <hr className="border-t border-border" />
                <SearchForm />
            </SidebarHeader>
            <SidebarContent>
                {/* We create a SidebarGroup for each parent. */}
                {data.navMain.map((item) => (
                    <SidebarGroup key={item.title}>
                        <SidebarGroupLabel className="uppercase text-muted-foreground/60">
                            {item.title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {item.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            className="group/menu-button font-medium gap-3 h-8 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
                                            isActive={item.isActive}
                                        >
                                            <a href={item.url}>
                                                {item.icon && (
                                                    <item.icon
                                                        className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                                                        size={16}
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <hr className="border-t border-border mx-2 -mt-px" />
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={onSignOut}
                            className="font-medium gap-3 h-9 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto">
                            <LogOut
                                className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                                size={16}
                                aria-hidden="true"
                            />
                            <span>Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}