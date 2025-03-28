// src/routes/(app)/view.$itemId.tsx
import * as React from 'react';
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router';
import {
    Layout,
    TabNode,
    Action,
    Actions,
    Model,
    type ITabRenderValues
} from '@app/layout';
import * as Icons from 'lucide-react';

import { useLayoutStore, getTabData } from '@/lib/store/useLayoutStore';
import { DocumentPlaceholder, LibraryItemPlaceholder, UnknownPlaceholder } from '@/components/view/placeholders';
import { LoadingContainer } from '@app/ui/components/loading-container';
import { SidebarTrigger } from '@app/ui/components/sidebar';
import { cn } from '@app/ui/lib/utils';


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
    const Icon = nodeIconName ? Icons[nodeIconName as keyof typeof Icons] as React.ElementType : null;

    if (Icon) {
        renderValues.leading = <Icon className="h-3.5 w-3.5 opacity-80 flex-shrink-0" />;
    }

    renderValues.content = <span className="truncate">{node.getName()}</span>;

    // You can also add buttons here if needed:
    // renderValues.buttons.push(<button key="mybutton">...</button>);
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
    const isTabOpen = useLayoutStore((state) => !!state.tabs.get(itemId));

    const [isInitializing, setIsInitializing] = React.useState(true);

    // Effect to open or select the tab when the route loads/changes
    React.useEffect(() => {
        // ... (useEffect logic remains the same)
        if (!itemId) return;

        const tabName = name ?? `Item ${itemId.substring(0, 6)}`;
        const componentType = itemType ?? 'document';

        const tabData = {
            id: itemId,
            name: tabName,
            component: componentType,
            icon: iconName,
        };

        if (!isTabOpen) {
            addTab(tabData, undefined, true);
        } else {
            selectTab(itemId);
        }
        setActiveTabId(itemId);
        setIsInitializing(false);

        const currentTabData = getTabData(itemId);
        if (currentTabData && (currentTabData.name !== name || currentTabData.component !== itemType || currentTabData.icon !== iconName)) {
            const newSearchParams: ViewSearch = { name: currentTabData.name, type: currentTabData.component, icon: currentTabData.icon };
            if (JSON.stringify(newSearchParams) !== JSON.stringify(search)) {
                router.history.replace(location.pathname, newSearchParams);
            }
        }

    }, [itemId, name, itemType, iconName, isTabOpen, addTab, selectTab, setActiveTabId, router.history, location.pathname, search]); // Removed model dependency if not directly used

    // Factory function to render tab content
    const factory = (node: TabNode): React.ReactNode => {
        const component = node.getComponent();
        const nodeIconName = node.getIcon();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const Icon = nodeIconName ? Icons[nodeIconName as keyof typeof Icons] as React.ElementType : null;
        const props = { node, Icon };

        switch (component) {
            case 'document':
                return <DocumentPlaceholder {...props} />;
            case 'library-item':
                return <LibraryItemPlaceholder {...props} />;
            default:
                return <UnknownPlaceholder {...props} />;
        }
    };

    // Handle model changes from flexlayout actions
    const onModelChange = (currentModel: Model, action: Action) => {
        // ... (onModelChange logic remains the same)
        if (action.type === Actions.SELECT_TAB) {
            const selectedTabId = action.data.tabNode;
            setActiveTabId(selectedTabId);
            const activeTabData = getTabData(selectedTabId);
            if (activeTabData && selectedTabId !== itemId) {
                router.history.replace(`/view/${selectedTabId}`, {
                    name: activeTabData.name,
                    type: activeTabData.component,
                    icon: activeTabData.icon
                });
            }
        }
        else if (action.type === Actions.DELETE_TAB) {
            const deletedTabId = action.data.node;
            const nextActiveId = removeTab(deletedTabId);

            if (deletedTabId === itemId) {
                if (nextActiveId) {
                    const newActiveTabData = getTabData(nextActiveId);
                    if (newActiveTabData) {
                        navigate({
                            to: '/view/$itemId',
                            params: { itemId: nextActiveId },
                            search: { name: newActiveTabData.name, type: newActiveTabData.component, icon: newActiveTabData.icon },
                            replace: true
                        });
                    } else {
                        navigate({ to: '/', replace: true });
                    }
                } else {
                    navigate({ to: '/', replace: true });
                }
            }
        }
        else if (action.type === Actions.RENAME_TAB) {
            if (action.data.node === itemId && action.data.text !== name) {
                router.history.replace(location.pathname, { ...search, name: action.data.text });
            }
        }
    };


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
            <div className={cn("flex-grow overflow-hidden h-full", isInitializing ? 'opacity-0' : 'opacity-100 transition-opacity duration-200')}>
                <Layout
                    ref={setLayoutRef}
                    model={model}
                    factory={factory}
                    onModelChange={onModelChange}
                    // *** FIX: Use onRenderTab instead of titleFactory ***
                    onRenderTab={handleRenderTab}
                    // *** END FIX ***
                    icons={{
                        close: <Icons.X className="h-3 w-3" />,
                        maximize: <Icons.Maximize2 className="h-3 w-3" />,
                        restore: <Icons.Minimize2 className="h-3 w-3" />,
                        more: <Icons.MoreHorizontal className="h-4 w-4" />,
                        popout: <Icons.SquareArrowOutUpRight className="h-3 w-3" />,
                    }}
                // REMOVED titleFactory prop
                />
            </div>
        </div>
    );
}