import { useMatches, useNavigate } from "@tanstack/react-router";

import { WorkSpaceSwitcher } from "./workspace-switcher";
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
    Link as LinkIcon,
    Settings,
    HelpCircle,
} from "lucide-react";
import { HierarchicalSection } from "./hierarchical-section";
import { initialDocumentItems, initialLibraryItems, type ExtendedTreeItem } from "@/lib/mock/sidebar-data";

const staticNavData = {
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


interface AppSidebarProps {
    user: User;
    onSignOut: () => Promise<void>;
}

export function AppSidebar({ user, onSignOut }: AppSidebarProps) {
    const matches = useMatches();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = React.useState("");

    const isRouteActive = (url: string) => {
        if (!url || url === '#') return false;

        if (!matches || !Array.isArray(matches)) return false;

        const currentPathname = matches[matches.length - 1]?.pathname || '';

        if (url === "/") {
            return currentPathname === "/";
        }

        return matches.some(match => {
            if (match.pathname === url) return true;
            return url !== "/" && currentPathname.startsWith(url + "/");
        });
    };

    const handleTreeItemClick = (item: ExtendedTreeItem) => {
        if (item.data.url) {
            console.log("Navigating to:", item.data.url);
            navigate({ to: item.data.url });
        } else {
            console.log("Clicked item without URL:", item.data.name);
        }
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <WorkSpaceSwitcher
                    user={user}
                    onSignOut={onSignOut} // Pass the handler down
                />
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
                <SidebarMenu>
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
import type { User } from "@/lib/providers/session";

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