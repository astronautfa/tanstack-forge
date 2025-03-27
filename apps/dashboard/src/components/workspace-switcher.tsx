import {
    ChevronsUpDown,
    LogOut,
    Plus,
    Settings,
    User as UserIcon,
    Check,
    MoonIcon,
    SunIcon,
} from 'lucide-react';
import * as React from 'react';
import { useNavigate, useRouteContext } from '@tanstack/react-router';

import { Avatar, AvatarFallback, AvatarImage } from '@app/ui/components/avatar';
import { Button } from '@app/ui/components/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@app/ui/components/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@app/ui/components/tooltip';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@app/ui/components/sidebar"; // Using your sidebar structure
import { useTheme } from '@/lib/hooks/use-theme';
import type { User } from '@/lib/providers/session';


// Define the Workspace type (or import it)
export type Workspace = {
    id: string;
    name: string;
    icon?: React.ElementType;
    color?: string;
    role: 'Owner' | 'Admin' | 'Member';
    members: number;
};

// --- Mock Data (Replace with your actual data fetching/props) ---
const MOCK_WORKSPACES: Workspace[] = [
    { id: 'research', name: 'Research Workspace', role: 'Owner', members: 5, color: 'hsl(210, 80%, 60%)', icon: UserIcon }, // Example icon/color
    { id: 'personal', name: 'Personal Space', role: 'Owner', members: 1, color: 'hsl(140, 50%, 60%)' },
    { id: 'team-alpha', name: 'Team Alpha', role: 'Member', members: 8, color: 'hsl(30, 80%, 60%)', icon: UserIcon },
];
// --- End Mock Data ---

// --- Helper Function for Initials ---
function getInitials(name?: string | null): string {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

const WorkspaceIcon: React.FC<{ workspace: Workspace; className?: string }> = ({ workspace, className = 'size-5' }) => {
    const IconComponent = workspace.icon ?? UserIcon;
    const bgColor = workspace.color ?? 'hsl(var(--muted))';

    return (
        <Avatar className={` ${className}`}>
            <AvatarFallback
                className="text-[9px] font-medium text-white"
                style={{ backgroundColor: bgColor }}
            >
                <IconComponent className="size-3/5" />
            </AvatarFallback>
        </Avatar>
    );
};

interface WorkSpaceSwitcherProps {
    onSignOut: () => Promise<void>;
}

export function WorkSpaceSwitcher({
    onSignOut,
}: WorkSpaceSwitcherProps) {
    const navigate = useNavigate();

    const { user } = useRouteContext({
        from: '__root__',
        select: (context) => ({ user: context.user }),
    });

    const { toggleTheme, theme } = useTheme();

    // --- State for current workspace (replace with your logic) ---
    // This might come from a global state, URL param, or prop
    const [currentWorkspaceId, setCurrentWorkspaceId] = React.useState<string | null>(MOCK_WORKSPACES[0]?.id ?? null);
    const workspaces = MOCK_WORKSPACES; // Use mock or fetched data
    // --- End State ---

    const currentWorkspace = React.useMemo(
        () => workspaces.find((w) => w.id === currentWorkspaceId),
        [workspaces, currentWorkspaceId]
    );

    // --- Action Handlers (Implement or pass as props) ---
    const handleSwitchWorkspace = (workspaceId: string) => {
        console.log(`Switching to workspace: ${workspaceId}`);
        setCurrentWorkspaceId(workspaceId);
        // Add logic: Update global state, refetch data, navigate, etc.
        // toast.success(`Switched to ${workspaces.find(w => w.id === workspaceId)?.name}`); // Optional: Add toast notifications
    };

    const handleCreateWorkspace = () => {
        console.log('Trigger Create Workspace action');
        // Add logic: Open modal, navigate to create page, etc.
        // pushModal('CreateWorkspace'); // If using a modal system
        // toast.info('Create Workspace dialog would open here'); // Optional notification
    };
    // --- End Action Handlers ---


    // Signed Out State (Optional: Can be handled by router redirect)
    if (!user) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        size="md"
                        className="gap-3"
                        onClick={() => navigate({ to: '/auth/signin' })} // Navigate to your login route
                    >
                        <UserIcon className="size-5 text-muted-foreground" /> {/* Use a generic user icon */}
                        <div className="grid flex-1 text-left">
                            <span className="font-medium">Sign In</span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    // Signed In State
    return (
        <TooltipProvider delayDuration={150}>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="md" // Or adjust size as needed
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground gap-2.5 [&>svg]:size-auto"
                            >
                                {/* User Avatar */}
                                <Avatar className="size-6 border border-border">
                                    {/* <AvatarImage alt={user.name ?? ''} src={user.image ?? ''} /> */}
                                    <AvatarFallback className="text-[10px]">
                                        {/* {getInitials(user.name)} */}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Current Workspace Info */}
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {currentWorkspace?.name ?? 'Select Workspace'}
                                    </span>
                                </div>

                                {/* Dropdown Indicator */}
                                <ChevronsUpDown
                                    className="ms-auto text-muted-foreground/60"
                                    size={16}
                                    aria-hidden="true"
                                />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-lg pb-2"
                            align="start"
                            side="bottom"
                            sideOffset={6}
                        >
                            {/* User Info Header */}
                            <div className="flex items-center space-x-3 p-3 relative">
                                <Avatar className="size-9 border border-border">
                                    <AvatarImage alt={user.name!} src={user.image!} />
                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start justify-center space-y-0.5 text-start">
                                    <p className="line-clamp-1 text-sm font-medium">{user.name ?? 'User'}</p>
                                    <p className="text-xs font-medium leading-none text-muted-foreground">{user.email ?? 'No email'}</p>
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-1 right-1 text-muted-foreground hover:text-foreground"
                                            onClick={() => navigate({ to: '/settings' })}
                                        >
                                            <Settings className="size-4" />
                                            <span className="sr-only">Account Settings</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">Account Settings</TooltipContent>
                                </Tooltip>
                            </div>
                            <DropdownMenuSeparator />

                            {/* Workspace Selection */}
                            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                Workspaces
                            </DropdownMenuLabel>
                            <DropdownMenuGroup className="max-h-[250px] overflow-y-auto">
                                {workspaces.map((workspace) => (
                                    <DropdownMenuItem
                                        key={workspace.id}
                                        className="flex items-center gap-2.5 px-2 py-1.5 cursor-pointer"
                                        onClick={() => handleSwitchWorkspace(workspace.id)}
                                        disabled={workspace.id === currentWorkspaceId}
                                    >
                                        <WorkspaceIcon workspace={workspace} className="size-5" />
                                        <div className="flex flex-col flex-1">
                                            <span className="text-sm font-medium">{workspace.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {workspace.role} • {workspace.members} member{workspace.members !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        {workspace.id === currentWorkspaceId && (
                                            <Check className="size-4 ml-auto text-primary" />
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>

                            {/* Create Workspace */}
                            <DropdownMenuItem
                                className="flex items-center gap-2.5 px-2 py-1.5 cursor-pointer"
                                onClick={handleCreateWorkspace}
                            >
                                <div className="flex size-5 items-center justify-center rounded-sm bg-muted"> {/* Subtle background for icon */}
                                    <Plus className="size-3.5 text-muted-foreground" />
                                </div>
                                <span className="text-sm">Create Workspace</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* Other Actions */}
                            <DropdownMenuGroup>
                                {/* Placeholder: Theme Toggle */}
                                <DropdownMenuItem
                                    onClick={toggleTheme}
                                    className="gap-2 h-7 rounded-md bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
                                >
                                    {theme === 'light' ? (
                                        <SunIcon
                                            className="text-muted-foreground"
                                            size={16}
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <MoonIcon
                                            className="text-muted-foreground"
                                            size={16}
                                            aria-hidden="true"
                                        />
                                    )}
                                    <span>Theme</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    className="flex items-center gap-2.5 h-7 cursor-pointer"
                                    onClick={onSignOut}
                                >
                                    <LogOut className="size-3.5 text-muted-foreground" />
                                    <span className="text-xs">Sign Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </TooltipProvider>
    );
}