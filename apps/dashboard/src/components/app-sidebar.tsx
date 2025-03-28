// src/components/app-sidebar.tsx
import { Link, useMatches, useNavigate, useRouteContext } from "@tanstack/react-router";
import * as React from "react";
import * as Icons from 'lucide-react'; // Import all icons
import type { TreeItemIndex } from 'react-complex-tree'; // Import TreeItemIndex type

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
    // Removed SidebarInset and SidebarTrigger imports if they are not used here
} from "@app/ui/components/sidebar";
import { HierarchicalSection } from "./hierarchical-section";
import { initialDocumentItems, initialLibraryItems, type ExtendedTreeItem } from "@/lib/mock/sidebar-data";
import { SearchForm } from "./search-form"; // Assuming SearchForm is correctly defined/imported
import { useLayoutStore } from "@/lib/store/useLayoutStore"; // Import the layout store

// Define the search params interface expected by the view route
interface ViewSearch {
    name?: string;
    type?: string;
    icon?: string;
}

// Define the params interface expected by the view route
interface ViewParams {
    itemId: string;
}


// Static nav data (use specific icons from lucide-react)
const staticNavData = {
    navMain: [
        {
            title: "Sections",
            url: "#",
            items: [
                { title: "Dashboard", url: "/", icon: Icons.LayoutDashboard },
                { title: "Insights", url: "/insights", icon: Icons.BarChart2 },
                { title: "Contacts", url: "/contacts", icon: Icons.Users },
                { title: "Tools", url: "/tools", icon: Icons.Bot },
                { title: "Integration", url: "/integration", icon: Icons.Link },
                { title: "Library", url: "/library", icon: Icons.Library },
                { title: "Layout Demo", url: "/layout", icon: Icons.AppWindow },
            ],
        },
        {
            title: "Other",
            url: "#",
            items: [
                { title: "Settings", url: "/settings", icon: Icons.Settings },
                { title: "Help Center", url: "/help", icon: Icons.HelpCircle },
            ],
        },
    ],
};


interface AppSidebarProps {
    onSignOut: () => Promise<void>;
}

export function AppSidebar({ onSignOut }: AppSidebarProps) {
    const { user } = useRouteContext({
        from: '__root__',
        select: (context) => ({ user: context.user }),
    });
    const matches = useMatches();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = React.useState("");
    const activeLayoutTabId = useLayoutStore((state) => state.activeTabId);

    // Function to check if a route (static or dynamic view) is active
    const isRouteActive = (urlOrItemId: string, isHierarchical = false) => {
        if (!matches || !Array.isArray(matches) || matches.length === 0) return false;

        const latestMatch = matches[matches.length - 1];
        if (!latestMatch) return false;

        const currentPathname = latestMatch.pathname;

        if (isHierarchical) {
            // FIX 1: Safely access params and ensure comparison is string vs string
            const currentItemIdParam = (latestMatch.params as ViewParams)?.itemId; // Explicitly type params
            const itemIdAsString = String(urlOrItemId); // Ensure we compare strings

            return (currentPathname.startsWith('/view/') && currentItemIdParam === itemIdAsString) ||
                (activeLayoutTabId === itemIdAsString);
        } else {
            // Handle static routes
            if (!urlOrItemId || urlOrItemId === '#') return false;
            if (urlOrItemId === "/") {
                return currentPathname === "/";
            }
            return currentPathname === urlOrItemId || currentPathname.startsWith(urlOrItemId + '/');
        }
    };


    // --- MODIFIED: Handle tree item click to navigate to the view route ---
    const handleTreeItemClick = (item: ExtendedTreeItem) => {
        console.log("Tree item clicked:", item.index, item.data.name);

        // FIX 2: Convert item.index to string for the parameter
        const itemIdStr = String(item.index);
        const targetPath = `/view/$itemId`;
        const params: ViewParams = { itemId: itemIdStr }; // Use ViewParams type

        let iconName: string | undefined = undefined;
        if (typeof item.data.icon === 'function') {
            iconName = item.data.icon.displayName || item.data.icon.name;
        } else if (typeof item.data.icon === 'string') {
            iconName = item.data.icon;
        }

        const searchParams: ViewSearch = {
            name: item.data.name,
            type: item.data.type,
            icon: iconName,
        };

        navigate({
            to: targetPath,
            params: params, // Pass explicitly typed params
            search: searchParams,
            replace: false
        });
    };
    // --- END MODIFICATION ---

    return (
        <Sidebar>
            <SidebarHeader>
                <WorkSpaceSwitcher onSignOut={onSignOut} />
                <hr className="border-t border-border" />
                {/* FIX 3: Correct event type for SearchForm onChange */}
                <SearchForm
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} // Correct event type
                />
            </SidebarHeader>
            <SidebarContent>
                {/* Static Navigation */}
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
                                            <Link to={item.url}>
                                                {item.icon && (
                                                    <item.icon
                                                        className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary flex-shrink-0"
                                                        size={16}
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                <span className="truncate">{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}

                {/* Hierarchical Sections */}
                <HierarchicalSection
                    title="Documents"
                    treeId="documents-tree"
                    initialItems={initialDocumentItems}
                    rootItem="root"
                    searchTerm={searchTerm}
                    onPrimaryAction={handleTreeItemClick}
                    activeItemId={activeLayoutTabId}
                    // FIX 4: Ensure itemId passed to isRouteActive is a string
                    isItemActive={(itemId: TreeItemIndex) => isRouteActive(String(itemId), true)}
                />

                <HierarchicalSection
                    title="Library"
                    treeId="library-tree"
                    initialItems={initialLibraryItems}
                    rootItem="root"
                    searchTerm={searchTerm}
                    onPrimaryAction={handleTreeItemClick}
                    activeItemId={activeLayoutTabId}
                    // FIX 4: Ensure itemId passed to isRouteActive is a string
                    isItemActive={(itemId: TreeItemIndex) => isRouteActive(String(itemId), true)}
                />

            </SidebarContent>
            <SidebarFooter>
                {/* Footer content */}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
