import { useMatches, useNavigate } from "@tanstack/react-router"; // Import useNavigate

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
    Link as LinkIcon, // Renamed to avoid conflict
    Settings,
    HelpCircle,
    LogOut,
    // LibraryBig // We'll replace this section
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { HierarchicalSection } from "./hierarchical-section"; // Import the new component
import { initialDocumentItems, initialLibraryItems, type ExtendedTreeItem } from "@/lib/mock/sidebar-data"; // Import data and types

// Keep your existing data for static items
const staticNavData = {
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
                { title: "Dashboard", url: "/", icon: LayoutDashboard },
                { title: "Insights", url: "/insights", icon: BarChart2 },
                { title: "Contacts", url: "/contacts", icon: Users },
                { title: "Tools", url: "/tools", icon: Code },
                { title: "Integration", url: "/integration", icon: LinkIcon },
            ],
        },
        {
            title: "Other",
            url: "#",
            items: [
                { title: "Settings", url: "/settings", icon: Settings },
                { title: "Help Center", url: "/help", icon: HelpCircle },
            ],
        },
    ],
};


interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    onSignOut?: () => Promise<void> | void;
}

export function AppSidebar({ onSignOut, ...props }: AppSidebarProps) {
    const matches = useMatches();
    const navigate = useNavigate(); // Hook for navigation
    const [searchTerm, setSearchTerm] = React.useState("");

    const isRouteActive = (url: string) => {
        // Your existing isRouteActive logic...
        if (!url || url === '#') return false; // Don't match placeholder URLs
        if (url === "/") {
            return matches.length === 1 && matches[0].pathname === "/";
        }
        return matches.some(match => {
            if (match.pathname === url) return true;
            // Only highlight parent if it's not the exact root and the current path starts with it
            return url !== "/" && match.pathname.startsWith(url + "/");
        });
    };

    // Handler for clicking on a tree item
    const handleTreeItemClick = (item: ExtendedTreeItem) => {
        if (item.data.url) {
            console.log("Navigating to:", item.data.url);
            // Use TanStack Router's navigate function
            navigate({ to: item.data.url });
        } else {
            console.log("Clicked item without URL:", item.data.name);
            // Maybe expand/collapse folder on primary click? RCT handles this by default.
        }
    };

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={staticNavData.teams} />
                <hr className="border-t border-border" />
                <SearchForm
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </SidebarHeader>
            <SidebarContent>
                {/* --- Static Sections --- */}
                {staticNavData.navMain.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel className="uppercase text-muted-foreground/60">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            className="group/menu-button font-medium gap-3 h-8 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
                                            isActive={isRouteActive(item.url)}
                                        >
                                            {/* Use Link from @tanstack/react-router for client-side routing */}
                                            <a href={item.url} onClick={(e) => { e.preventDefault(); navigate({ to: item.url }); }}>
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

                {/* --- Dynamic Document Section --- */}
                <HierarchicalSection
                    title="Documents"
                    treeId="documents-tree"
                    initialItems={initialDocumentItems}
                    rootItem="root"
                    searchTerm={searchTerm}
                    onPrimaryAction={handleTreeItemClick}
                />

                {/* --- Dynamic Library Section --- */}
                <HierarchicalSection
                    title="Library"
                    treeId="library-tree"
                    initialItems={initialLibraryItems}
                    rootItem="root"
                    searchTerm={searchTerm}
                    onPrimaryAction={handleTreeItemClick}
                />

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
                            className="font-medium gap-3 h-8 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 [&>svg]:size-auto"
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

// --- Update SearchForm to be controlled ---
// src/components/search-form.tsx (Example modification)
import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@app/ui/components/input"; // Adjust path

interface SearchFormProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SearchForm({ value, onChange, ...props }: SearchFormProps) {
    return (
        <form onSubmit={(e) => e.preventDefault()} className="py-1">
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full rounded-md bg-background pl-8 h-8" // Adjusted height and padding
                    value={value}
                    onChange={onChange}
                    {...props}
                />
            </div>
        </form>
    );
}