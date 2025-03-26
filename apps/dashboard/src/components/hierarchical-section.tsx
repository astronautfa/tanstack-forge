import * as React from "react";
import type { HTMLProps, RefObject } from 'react';
import {
    Tree,
    ControlledTreeEnvironment,
    type TreeItemIndex,
    type DraggingPosition,
    type TreeEnvironmentRef,
    type TreeItemRenderContext,
    type TreeInformation,
    type TreeChangeHandlers,
    type ExplicitDataSource,
    type TreeCapabilities,
    type DraggingPositionItem,
    type DraggingPositionRoot
} from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import { ChevronRight, MoreHorizontal, GripVertical, FileText } from "lucide-react";
import { cn } from "@app/ui/lib/utils";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenuItem,
} from "@app/ui/components/sidebar";
import { Button } from "@app/ui/components/button";
import { type ItemData, type ExtendedTreeItem, type TreeItems, defaultIcons } from "@/lib/mock/sidebar-data";

interface HierarchicalSectionProps {
    title: string;
    treeId: string;
    initialItems: TreeItems;
    rootItem?: TreeItemIndex;
    searchTerm?: string;
    onPrimaryAction?: (item: ExtendedTreeItem) => void;
}

function getTargetParentId(target: DraggingPosition): TreeItemIndex {
    if (target.targetType === 'root') {
        return (target as DraggingPositionRoot).targetItem;
    }
    return target.parentItem;
}

// Helper function to safely get targetItem from any DraggingPosition
function getTargetItem(target: DraggingPosition): TreeItemIndex | undefined {
    if (target.targetType === 'item') {
        return (target as DraggingPositionItem).targetItem;
    } else if (target.targetType === 'root') {
        return (target as DraggingPositionRoot).targetItem;
    }
    return undefined;
}

export function HierarchicalSection({
    title,
    treeId,
    initialItems,
    rootItem = "root",
    searchTerm = "",
    onPrimaryAction,
}: HierarchicalSectionProps) {
    const [items, setItems] = React.useState<TreeItems>(initialItems);
    const [focusedItem, setFocusedItem] = React.useState<TreeItemIndex>();
    const [expandedItems, setExpandedItems] = React.useState<TreeItemIndex[]>(() => {
        const root = items[rootItem];
        const validChildren = (root?.children ?? []).filter(childId => items[childId]);
        return root ? [rootItem, ...validChildren] : [rootItem];
    });
    const [selectedItems, setSelectedItems] = React.useState<TreeItemIndex[]>([]);
    // Type the ref correctly
    const environmentRef = React.useRef<TreeEnvironmentRef<ItemData>>(null);

    // --- Search Logic (Types checked) ---
    const { filteredItems, itemsToExpand } = React.useMemo(() => {
        if (!searchTerm) {
            const rootExists = items[rootItem];
            return {
                filteredItems: rootExists ? items : { [rootItem]: { index: rootItem, data: { name: 'Root', type: 'folder' }, isFolder: true, children: [] } },
                itemsToExpand: []
            };
        }

        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchingItemIds: TreeItemIndex[] = Object.values(items)
            .filter(item => item.data.name.toLowerCase().includes(lowerSearchTerm))
            .map(item => item.index);

        if (matchingItemIds.length === 0) {
            const rootExists = items[rootItem];
            return {
                filteredItems: rootExists ? { [rootItem]: items[rootItem] } : {},
                itemsToExpand: []
            };
        }

        const itemsToInclude = new Set<TreeItemIndex>(matchingItemIds);
        const necessaryParents = new Set<TreeItemIndex>([rootItem]);

        const addAncestors = (itemId: TreeItemIndex) => {
            if (itemId === rootItem) return; // Base case: stop at root

            for (const potentialParentId in items) {
                const potentialParent = items[potentialParentId];
                if (potentialParent.children?.includes(itemId)) {
                    if (!necessaryParents.has(potentialParentId)) {
                        necessaryParents.add(potentialParentId);
                        addAncestors(potentialParentId); // Recurse upwards
                    }
                    break; // Found direct parent
                }
            }
        };

        matchingItemIds.forEach(addAncestors);
        necessaryParents.forEach(id => itemsToInclude.add(id));

        const resultItems: TreeItems = {};
        itemsToInclude.forEach(id => {
            const originalItem = items[id];
            if (originalItem) {
                const originalChildren = originalItem.children || [];
                const filteredChildren = originalChildren.filter(childId => itemsToInclude.has(childId));
                resultItems[id] = { ...originalItem, children: filteredChildren };
            }
        });

        if (!resultItems[rootItem] && items[rootItem]) {
            const originalChildren = items[rootItem].children || [];
            const filteredChildren = originalChildren.filter(childId => itemsToInclude.has(childId));
            resultItems[rootItem] = { ...items[rootItem], children: filteredChildren };
        } else if (resultItems[rootItem]) {
            const originalChildren = resultItems[rootItem].children || [];
            const filteredChildren = originalChildren.filter(childId => itemsToInclude.has(childId));
            resultItems[rootItem].children = filteredChildren;
        } else if (!resultItems[rootItem] && !items[rootItem]) {
            // If root doesn't exist at all, create a placeholder
            resultItems[rootItem] = { index: rootItem, data: { name: 'Root', type: 'folder' }, isFolder: true, children: [] };
        }


        return { filteredItems: resultItems, itemsToExpand: Array.from(necessaryParents) };
    }, [searchTerm, items, rootItem]);

    // --- Expand necessary parents effect (Types checked) ---
    React.useEffect(() => {
        if (searchTerm && itemsToExpand.length > 0) {
            setExpandedItems(prev => [...new Set([...prev, ...itemsToExpand])]);
        }
    }, [searchTerm, itemsToExpand]);


    // --- Drag and Drop Handler (Fixes for parentItem/childIndex) ---
    const handleDrop: TreeChangeHandlers<ItemData>['onDrop'] = (draggedItems, target) => {
        if (!draggedItems || draggedItems.length === 0) return;

        console.log("Dropped:", draggedItems.map(i => i.index), "onto:", target);

        setItems(prevItems => {
            let newItems = { ...prevItems };
            const draggedItemIds = draggedItems.map(item => item.index);

            // 1. Remove items from original parents
            Object.keys(newItems).forEach(parentId => {
                const parent = newItems[parentId];
                if (parent.children) {
                    const newChildren = parent.children.filter(childId => !draggedItemIds.includes(childId));
                    // Only update if children actually changed
                    if (newChildren.length !== parent.children.length) {
                        newItems[parentId] = { ...parent, children: newChildren };
                    }
                }
            });


            // 2. Insert items into the new location
            const targetParentId = getTargetParentId(target); // Use helper function
            const targetParent = newItems[targetParentId];
            if (!targetParent) return prevItems; // Parent not found, abort

            const currentChildren = targetParent.children ?? [];
            let newChildren: TreeItemIndex[];

            if (target.targetType === "item") {
                // Drop onto item: Append dragged items to target's children
                newChildren = [...currentChildren, ...draggedItemIds];
                newItems[targetParentId] = { ...targetParent, children: newChildren, isFolder: true };
            } else {
                // Drop between items or into root
                let insertionIndex: number;
                if (target.targetType === 'between-items') {
                    insertionIndex = target.childIndex; // Use childIndex for between-items
                } else { // targetType === 'root'
                    insertionIndex = currentChildren.length; // Append to root by default (Fix 2)
                }

                newChildren = [
                    ...currentChildren.slice(0, insertionIndex),
                    ...draggedItemIds,
                    ...currentChildren.slice(insertionIndex),
                ];
                newItems[targetParentId] = { ...targetParent, children: newChildren };
            }

            return newItems;
        });
    };

    // --- Rename Handler (Types checked) ---
    const handleRename: TreeChangeHandlers<ItemData>['onRenameItem'] = (item, name) => {
        setItems(prev => {
            if (!prev[item.index]) return prev;
            return {
                ...prev,
                [item.index]: {
                    ...prev[item.index],
                    data: { ...item.data, name },
                },
            };
        });
    };


    // --- Render Item Function (Fixes for context props and rename handling) ---
    const renderTreeItem = ({
        item,
        depth,
        children,
        title,
        context,
    }: {
        item: ExtendedTreeItem;
        depth: number;
        children: React.ReactNode | null;
        title: React.ReactNode;
        context: TreeItemRenderContext<never>; // Correct context type
        info: TreeInformation;
    }) => {
        const IconComponent = item.data.icon || defaultIcons[item.data.type] || FileText;
        const isRenaming = context.isRenaming ?? false;
        const isFolder = item.isFolder ?? false;
        const isActive = context.isFocused ?? false;
        // Use isDraggingOver and canDropOn for drop target highlighting (Fix 3)
        const isDropTarget = (context.isDraggingOver ?? false) && (context.canDropOn ?? false);

        return (
            <SidebarMenuItem
                key={item.index}
                className={cn(
                    "rct-tree-item-li group/item relative",
                    // Highlight when dragging OVER
                    context.isDraggingOver && !isDropTarget && "bg-muted/40", // General hover-while-dragging
                    // Highlight specifically when it's a VALID drop target ONTO this item
                    isDropTarget && "bg-accent/30 ring-1 ring-accent/70",
                )}
                style={{ paddingLeft: `${depth * 16}px` }}
                {...context.itemContainerWithChildrenProps}
            >
                <div
                    className={cn(
                        "flex items-center w-full h-7 px-1 rounded text-sm group/button",
                        "hover:bg-muted/50",
                        isActive && "bg-accent text-accent-foreground",
                    )}
                    {...context.itemContainerWithoutChildrenProps}
                    {...context.interactiveElementProps} // This handles drag initiation, click, focus etc.
                >
                    {/* Drag Handle Appearance (No specific props, rely on item drag) (Fix 4 Removed spread) */}
                    <div className="mr-1 opacity-0 group-hover/item:opacity-40 hover:opacity-100 cursor-grab touch-none p-px">
                        <GripVertical size={14} />
                    </div>

                    {/* Arrow */}
                    <div className="w-4 h-4 mr-0.5 flex items-center justify-center" {...context.arrowProps}>
                        {isFolder && (
                            context.isExpanded ? (
                                <ChevronRight size={14} className="transform rotate-90 transition-transform duration-150 text-muted-foreground/80" />
                            ) : (
                                <ChevronRight size={14} className="transition-transform duration-150 text-muted-foreground/80" />
                            )
                        )}
                    </div>

                    {/* Icon/Emoji */}
                    <div className="w-4 h-4 mr-1.5 flex items-center justify-center shrink-0">
                        {item.data.emoji ? (
                            <span className="text-sm select-none">{item.data.emoji}</span>
                        ) : (
                            <IconComponent size={14} className={cn(isActive ? "text-accent-foreground" : "text-muted-foreground/90")} />
                        )}
                    </div>

                    {/* Title / Rename Input (Fix 5 for stopRenamingItem) */}
                    <span className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap pr-1">
                        {isRenaming ? (
                            <input
                                type="text"
                                // Use context.item.data.name directly? Or getItemTitle? Let's use item.data.name
                                defaultValue={item.data.name}
                                onBlur={() => {
                                    // On blur, just signal rename stop. RCT handles value persistence if not aborted.
                                    context.stopRenamingItem(); // <-- No arguments
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault(); // Prevent form submission if any
                                        context.stopRenamingItem(); // <-- No arguments
                                    }
                                    if (e.key === 'Escape') {
                                        context.stopRenamingItem(); // <-- No arguments (signals abort)
                                    }
                                }}
                                autoFocus
                                className="w-full bg-transparent outline-none border border-input px-1 py-0 text-sm rounded-sm"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            title // Render title from context
                        )}
                    </span>

                    {/* Actions on Hover */}
                    {!isRenaming && (
                        <div className="ml-auto pl-1 opacity-0 group-hover/button:opacity-100">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={(e) => { e.stopPropagation(); console.log("Actions for:", item.data.name); }}
                                aria-label={`Actions for ${item.data.name}`}
                            >
                                <MoreHorizontal size={14} />
                            </Button>
                        </div>
                    )}
                </div>
                {children}
            </SidebarMenuItem>
        );
    };

    // --- Render Drag Placeholder Line (Types checked) ---
    const renderDragBetweenLine = ({ draggingPosition, lineProps }: {
        draggingPosition: DraggingPosition;
        lineProps: HTMLProps<HTMLDivElement>; // Correct type from react
    }) => (
        <div
            {...lineProps}
            style={{
                ...(lineProps.style || {}),
                width: `calc(100% - ${draggingPosition.depth * 16 + 4}px)`,
                left: `${draggingPosition.depth * 16 + 4}px`,
                height: '2px',
                backgroundColor: 'hsl(var(--primary))',
                position: 'absolute',
                zIndex: 100,
                pointerEvents: 'none',
            }}
        />
    );

    // Define capabilities separately to fix the type issue with canRenameItem
    const treeCapabilities: TreeCapabilities<ItemData> = {
        canDrag: (items: ExtendedTreeItem[]) => items.every(item => item.canMove ?? true),
        canDropAt: (items: ExtendedTreeItem[], target: DraggingPosition): boolean => {
            // Cannot drop item onto itself
            const targetItem = getTargetItem(target);
            if (targetItem && items.some(draggedItem => draggedItem.index === targetItem)) return false;

            // Cannot drop onto a document type item
            if (target.targetType === 'item') {
                const itemTargetItem = (target as DraggingPositionItem).targetItem;
                const targetItemData = filteredItems[itemTargetItem]?.data;
                if (targetItemData?.type === 'document') return false;
            }

            // Prevent dropping parent folder into its own child
            const isDroppingParentIntoChild = items.some((draggedItem: ExtendedTreeItem) => {
                let currentTargetId: TreeItemIndex | undefined;

                if (target.targetType === 'item') {
                    currentTargetId = (target as DraggingPositionItem).targetItem;
                } else if (target.targetType === 'root') {
                    currentTargetId = (target as DraggingPositionRoot).targetItem;
                } else {
                    currentTargetId = target.parentItem;
                }

                while (currentTargetId && currentTargetId !== rootItem) {
                    if (currentTargetId === draggedItem.index) return true; // Found dragged item as ancestor

                    // Find parent of currentTargetId within the *currently rendered* items
                    const parentEntry = Object.entries(filteredItems).find(([_, item]) => item.children?.includes(currentTargetId!));
                    currentTargetId = parentEntry ? parentEntry[0] : undefined;
                }
                return false;
            });
            if (isDroppingParentIntoChild) return false;

            return true; // Default allow if no rules failed
        },
        canRename: true // Changed from canRenameItem
    };

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="uppercase text-muted-foreground/60 px-2">
                {title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <ControlledTreeEnvironment<ItemData>
                    ref={environmentRef as RefObject<TreeEnvironmentRef<ItemData, never>>}
                    // Data Source
                    items={filteredItems as ExplicitDataSource<ItemData>['items']}
                    getItemTitle={(item: ExtendedTreeItem) => item.data.name}

                    // View State
                    viewState={{
                        [treeId]: {
                            focusedItem: focusedItem,
                            expandedItems: expandedItems ?? [],
                            selectedItems: selectedItems ?? [],
                        },
                    }}

                    // Handlers
                    onFocusItem={(item) => setFocusedItem(item.index)}
                    onExpandItem={(item) => setExpandedItems(prev => [...new Set([...(prev ?? []), item.index])])}
                    onCollapseItem={(item) => setExpandedItems(prev => (prev ?? []).filter((id) => id !== item.index))}
                    onSelectItems={(items) => setSelectedItems(items)}
                    onDrop={handleDrop}
                    onRenameItem={handleRename}

                    // Apply capabilities from the object we defined above
                    {...treeCapabilities}

                    // Renderers
                    renderItem={renderTreeItem}
                    renderDragBetweenLine={renderDragBetweenLine}

                    onPrimaryAction={onPrimaryAction}
                >
                    {/* Fix for rootItem type - ensure it's a string */}
                    <Tree
                        treeId={treeId}
                        rootItem={String(rootItem)}
                        treeLabel={title}
                    />
                </ControlledTreeEnvironment>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}