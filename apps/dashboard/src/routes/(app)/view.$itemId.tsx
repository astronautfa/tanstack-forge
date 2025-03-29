// src/routes/(app)/view/$itemId.tsx

import * as React from 'react';
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router';
import {
    Layout,
    TabNode,
    Action,
    Actions,
    Model,
    type ITabRenderValues,
    Node, // Import Node type
    TabSetNode, // Import TabSetNode
    BorderNode, // Import BorderNode
} from '@app/layout';

import * as Icons from 'lucide-react';

import { useLayoutStore, getTabData, type TabData } from '@/lib/store/use-layout-store'; // Import TabData type
import { DocumentPlaceholder, LibraryItemPlaceholder, UnknownPlaceholder } from '@/components/view/placeholders';
import { LoadingContainer } from '@app/ui/components/loading-container';
import { SidebarTrigger } from '@app/ui/components/sidebar';

import { cn } from '@app/ui/lib/utils';
import { debounce } from '@/lib/utils/debounce';

interface ViewSearch {
    name?: string;
    type?: string;
    icon?: string;
}

export const Route = createFileRoute('/(app)/view/$itemId')({
    validateSearch: (search): ViewSearch => ({
        name: search.name as string | undefined,
        type: search.type as string | undefined,
        icon: search.icon as string | undefined,
    }),
    component: ViewPage,
});

const handleRenderTab = (node: TabNode, renderValues: ITabRenderValues) => {
    const nodeIconName = node.getIcon();
    // Ensure Icons is treated correctly if it might be undefined or lack keys
    const Icon = nodeIconName && Icons && (Icons as any)[nodeIconName] ? (Icons as any)[nodeIconName] as React.ElementType : null;

    if (Icon) {
        renderValues.leading = <Icon className="h-3.5 w-3.5 opacity-80 flex-shrink-0" />;
    } else if (nodeIconName) {
        // Optionally handle case where icon name exists but component doesn't
        console.warn(`Icon component not found for name: ${nodeIconName}`);
        // renderValues.leading = <Icons.HelpCircle className="h-3.5 w-3.5 opacity-50 flex-shrink-0" />; // Example fallback
    }


    renderValues.content = <span className="truncate">{node.getName()}</span>;
};


function ViewPage() {
    const params = Route.useParams();
    const search = Route.useSearch();

    const { itemId } = params;
    const { name, type: itemType = 'document', icon: iconName } = search;

    const navigate = useNavigate();
    const router = useRouter();

    // Get state and actions from Zustand store
    const model = useLayoutStore((state) => state.model);
    const setLayoutRef = useLayoutStore((state) => state.setLayoutRef);
    const addTab = useLayoutStore((state) => state.addTab);
    const selectTab = useLayoutStore((state) => state.selectTab);
    const removeTab = useLayoutStore((state) => state.removeTab);
    const setActiveTabId = useLayoutStore((state) => state.setActiveTabId);
    const renameTab = useLayoutStore((state) => state.renameTab); // Get renameTab action
    const isTabOpen = useLayoutStore((state) => state.tabs.has(itemId)); // Use has() for efficiency
    const persistLayout = useLayoutStore((state) => state.persistLayout); // Get persist action

    const [isInitializing, setIsInitializing] = React.useState(true);

    // --- Debounced persistence function ---
    const debouncedPersistLayout = React.useCallback(
        debounce(() => {
            console.log("[ViewPage] Debounced persist triggered (custom debounce).");
            persistLayout();
        }, 1000), // 1000ms debounce delay
        [persistLayout] // Dependency list is correct
    );

    // Effect to cancel pending saves on unmount
    React.useEffect(() => {
        return () => {
            debouncedPersistLayout.cancel();
            console.log("[ViewPage] Unmounting, cancelled pending layout persistence.");
        };
    }, [debouncedPersistLayout]);
    // --- End Debounced persistence ---


    React.useEffect(() => {
        if (!itemId) return;

        const tabName = name ?? `Item ${itemId.substring(0, 6)}`;
        const componentType = itemType ?? 'document';

        const tabData: TabData = { // Use TabData type
            id: itemId,
            name: tabName,
            component: componentType,
            icon: iconName,
        };

        if (!isTabOpen) {
            console.log("[ViewPage] Adding tab:", itemId);
            addTab(tabData, undefined, true);
        } else {
            console.log("[ViewPage] Selecting existing tab:", itemId);
            // Ensure tab data is up-to-date even if tab exists
            const currentTabData = getTabData(itemId);
            if (!currentTabData || currentTabData.name !== tabData.name || currentTabData.icon !== tabData.icon || currentTabData.component !== tabData.component) {
                console.log("[ViewPage] Updating existing tab data in store for:", itemId);
                // This doesn't rename in FlexLayout model, only updates our store map if needed
                const store = useLayoutStore.getState();
                const newTabs = new Map(store.tabs);
                newTabs.set(itemId, tabData);
                store.setModel(store.model); // Trigger a state update to reflect potentially changed tab map
            }

            selectTab(itemId);
        }
        // setActiveTabId is handled by selectTab or addTab now
        setIsInitializing(false); // Mark initialization complete

        // Sync URL search params if they differ from the canonical tab data in the store
        const canonicalTabData = getTabData(itemId);
        if (canonicalTabData) {
            const currentSearchParams: ViewSearch = { name, type: itemType, icon: iconName };
            const canonicalSearchParams: ViewSearch = { name: canonicalTabData.name, type: canonicalTabData.component, icon: canonicalTabData.icon };
            // Only replace history if the search params actually differ
            if (JSON.stringify(currentSearchParams) !== JSON.stringify(canonicalSearchParams)) {
                console.log("[ViewPage] Syncing URL search params for:", itemId);
                router.history.replace(location.pathname, canonicalSearchParams);
            }
        }

    }, [itemId, name, itemType, iconName, isTabOpen, addTab, selectTab, router.history, location.pathname]); // Removed setActiveTabId, search dependencies

    const factory = (node: TabNode): React.ReactNode => {
        const component = node.getComponent();
        const nodeIconName = node.getIcon();
        // Ensure Icons is treated correctly
        const Icon = nodeIconName && Icons && (Icons as any)[nodeIconName] ? (Icons as any)[nodeIconName] as React.ElementType : null;
        const props = { node, Icon }; // Pass node and potentially Icon

        switch (component) {
            case 'document':
                return <DocumentPlaceholder {...props} />;
            case 'library-item':
                return <LibraryItemPlaceholder {...props} />;
            default:
                return <UnknownPlaceholder {...props} />;
        }
    };

    // --- Modified onModelChange ---
    const onModelChange = (currentModel: Model, action: Action) => {
        console.log("[ViewPage] Model Changed, Action:", action.type, action.data);
        // Trigger debounced save on *any* model change
        debouncedPersistLayout();

        // Handle specific actions for navigation and state updates
        if (action.type === Actions.SELECT_TAB) {
            const selectedTabId = action.data.tabNode;
            setActiveTabId(selectedTabId); // Update Zustand state

            const activeTabData = getTabData(selectedTabId);
            if (activeTabData && selectedTabId !== itemId) { // Check if navigating away
                console.log(`[ViewPage] Navigating to selected tab: ${selectedTabId}`);
                navigate({ // Use navigate for proper TanStack routing
                    to: '/view/$itemId',
                    params: { itemId: selectedTabId },
                    search: { name: activeTabData.name, type: activeTabData.component, icon: activeTabData.icon },
                    replace: true // Replace history state when just switching tabs
                });
            }
        }
        else if (action.type === Actions.DELETE_TAB) {
            const deletedTabId = action.data.node;
            const nextActiveId = removeTab(deletedTabId); // removeTab now handles finding the next active

            if (deletedTabId === itemId) { // If the *current route's* tab was deleted
                if (nextActiveId) {
                    const newActiveTabData = getTabData(nextActiveId);
                    if (newActiveTabData) {
                        console.log(`[ViewPage] Navigating to next active tab after delete: ${nextActiveId}`);
                        navigate({
                            to: '/view/$itemId',
                            params: { itemId: nextActiveId },
                            search: { name: newActiveTabData.name, type: newActiveTabData.component, icon: newActiveTabData.icon },
                            replace: true
                        });
                    } else {
                        console.log("[ViewPage] No next active tab found, navigating to root.");
                        navigate({ to: '/', replace: true }); // Navigate home if no tabs left
                    }
                } else {
                    console.log("[ViewPage] Last tab deleted, navigating to root.");
                    navigate({ to: '/', replace: true }); // Navigate home if no tabs left
                }
            }
            // No 'else' needed - if a different tab was deleted, navigation isn't required here.
        }
        else if (action.type === Actions.RENAME_TAB) {
            // Update the zustand store map (handled by renameTab action now)
            renameTab(action.data.node, action.data.text);

            // If the renamed tab is the one currently shown in the URL, update search params
            if (action.data.node === itemId && action.data.text !== name) {
                console.log(`[ViewPage] Updating URL search params after rename for: ${itemId}`);
                router.history.replace(location.pathname, { ...search, name: action.data.text });
            }
        }
        // Add handlers for other actions if needed (e.g., MOVE_NODE might affect active tab)
    };
    // --- End Modified onModelChange ---


    return (
        <div className="flex flex-col h-full w-full relative bg-background">
            <SidebarTrigger
                className={cn(
                    "text-muted-foreground absolute left-2 top-2 z-50",
                )}
            />
            {isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center z-40 bg-background/50 backdrop-blur-sm">
                    <LoadingContainer isLoading={true} />
                </div>
            )}
            {/* Ensure Layout doesn't render until model is ready */}
            {!isInitializing && model && (
                <div className={cn("flex-grow overflow-hidden h-full", 'opacity-100 transition-opacity duration-200')}>
                    <Layout
                        ref={setLayoutRef}
                        model={model}
                        factory={factory}
                        onModelChange={onModelChange}
                        onRenderTab={handleRenderTab}
                        // Ensure icons are always defined
                        icons={{
                            close: <Icons.X className="h-3 w-3" />,
                            maximize: <Icons.Maximize2 className="h-3 w-3" />,
                            restore: <Icons.Minimize2 className="h-3 w-3" />,
                            more: <Icons.MoreHorizontal className="h-4 w-4" />,
                            popout: <Icons.SquareArrowOutUpRight className="h-3 w-3" />,
                            // Provide defaults for other icons if needed by layout/borders
                            closeTabset: <Icons.X className="h-3 w-3" />,
                            edgeArrow: undefined, // Or provide an icon if edge docking is used
                            activeTabset: undefined, // Or provide an icon
                        }}
                    />
                </div>
            )}
        </div>
    );
}