import * as React from "react";
import { useMatches } from "@tanstack/react-router";

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
    Settings,
    HelpCircle,
    LogOut,
    LibraryBig,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

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
                    title: "Library",
                    url: "/library",
                    icon: LibraryBig,
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
    // Get all active route matches from TanStack Router
    const matches = useMatches();

    // Function to check if a URL is currently active
    const isRouteActive = (url: string) => {
        // Special case for root route - it should only match exactly "/" path
        if (url === "/") {
            // Check if we're exactly at the root route with no other segments
            return matches.some(match => match.pathname === "/") &&
                !matches.some(match => match.pathname !== "/");
        }

        // For other routes, check if any match has this path
        return matches.some(match => {
            // Exact match
            if (match.pathname === url) return true;

            // Or check if it's a parent route (for nested routes highlighting)
            return match.pathname.startsWith(url + "/");
        });
    };

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
                                            isActive={isRouteActive(item.url)}
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
                <hr className="border-t border-border" />
                <SidebarMenu>
                    <SidebarMenuItem>
                        <ThemeToggle />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={onSignOut}
                            className="font-medium gap-3 h-8 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
                        >
                            <LogOut
                                className="text-muted-foreground/60"
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