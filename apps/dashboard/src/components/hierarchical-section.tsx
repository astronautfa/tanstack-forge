import * as React from "react";
import type { HTMLProps } from 'react';
import {
    Tree,
    ControlledTreeEnvironment,
    type TreeItemIndex,
    type DraggingPosition,
    type TreeEnvironmentRef,
    type TreeItemRenderContext as LibraryTreeItemRenderContext,
    type TreeInformation,
    type TreeChangeHandlers,
    type ExplicitDataSource,
    type TreeCapabilities,
    type TreeItem,
} from "react-complex-tree";
import { ChevronRight, MoreHorizontal, FileText, Edit2, Copy, ArrowRight, Trash2, Link } from "lucide-react";
import { cn } from "@app/ui/lib/utils";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenuItem,
} from "@app/ui/components/sidebar";
import { Button } from "@app/ui/components/button";
import { type ItemData, type ExtendedTreeItem, type TreeItems, defaultIcons } from "@/lib/mock/sidebar-data";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@app/ui/components/dropdown-menu";

type TreeItemRenderContext = LibraryTreeItemRenderContext<never>;

interface HierarchicalSectionProps {
    title: string;
    treeId: string;
    initialItems: TreeItems;
    rootItem?: TreeItemIndex;
    searchTerm?: string;
    onPrimaryAction?: (item: ExtendedTreeItem) => void;
}

// --- Helper functions (getTargetParentId, getTargetItemId, isDescendant) - Adjusted based on provided types ---
function getTargetParentId(target: DraggingPosition, rootId: TreeItemIndex): TreeItemIndex {
    // From provided types: DraggingPositionItem, DraggingPositionBetweenItems, DraggingPositionRoot
    if (target.targetType === 'root') {
        // According to DraggingPositionRoot type, targetItem IS the root item index
        return target.targetItem; // Or simply rootId, should be the same
    } else {
        // Both 'item' and 'between-items' have parentItem property
        return target.parentItem;
    }
}

function getTargetItemId(target: DraggingPosition): TreeItemIndex | undefined {
    // Only DraggingPositionItem has targetItem representing the item *dropped onto*
    if (target.targetType === 'item') {
        return target.targetItem;
    }
    return undefined;
}

function isDescendant(items: TreeItems, parentId: TreeItemIndex, potentialChildId: TreeItemIndex): boolean {
    const visited = new Set<TreeItemIndex>();
    const check = (currentParentId: TreeItemIndex): boolean => {
        if (visited.has(currentParentId) || currentParentId === potentialChildId) return false; // Added self-check
        visited.add(currentParentId);

        const parent = items[currentParentId];
        // Check if parent exists and has children array
        if (!parent || !Array.isArray(parent.children) || parent.children.length === 0) {
            return false;
        }
        if (parent.children.includes(potentialChildId)) {
            return true;
        }
        // Recurse only if children exist and are valid items
        return parent.children.some(childId => items[childId] && check(childId));
    };
    // Ensure parentId itself exists before starting
    return items[parentId] ? check(parentId) : false;
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
        const initialExpanded = new Set<TreeItemIndex>([rootItem]);
        (root?.children ?? []).forEach(childId => {
            if (items[childId]) {
                initialExpanded.add(childId);
            }
        });
        initialExpanded.add(rootItem);
        return Array.from(initialExpanded);
    });
    const [selectedItems, setSelectedItems] = React.useState<TreeItemIndex[]>([]);

    const environmentRef = React.useRef<TreeEnvironmentRef<ItemData, never>>(null);

    const { filteredItems, itemsToExpand } = React.useMemo(() => {
        const rootExists = items[rootItem];
        const baseRootItem: ExtendedTreeItem = rootExists
            ? items[rootItem]
            : { index: rootItem, data: { name: 'Root', type: 'folder' }, isFolder: true, children: [] };

        if (!searchTerm) {
            return {
                filteredItems: items,
                itemsToExpand: []
            };
        }

        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchingItemIds = new Set<TreeItemIndex>();
        const necessaryItemIds = new Set<TreeItemIndex>([rootItem]);

        for (const itemId in items) {
            if (items[itemId].data.name.toLowerCase().includes(lowerSearchTerm)) {
                matchingItemIds.add(itemId);
            }
        }

        if (matchingItemIds.size === 0) {
            const emptyRoot = items[rootItem] ? { [rootItem]: { ...items[rootItem], children: [] } } : { [rootItem]: baseRootItem };
            return {
                filteredItems: emptyRoot,
                itemsToExpand: [rootItem]
            };
        }

        const addAncestors = (itemId: TreeItemIndex) => {
            if (itemId === rootItem || necessaryItemIds.has(itemId)) return;
            necessaryItemIds.add(itemId);
            for (const potentialParentId in items) {
                if (items[potentialParentId].children?.includes(itemId)) {
                    addAncestors(potentialParentId);
                    break;
                }
            }
        };

        matchingItemIds.forEach(id => {
            addAncestors(id);
        });

        const resultItems: TreeItems = {};
        necessaryItemIds.forEach(id => {
            const originalItem = items[id];
            if (originalItem) {
                const originalChildren = originalItem.children || [];
                const filteredChildren = originalChildren.filter(childId => necessaryItemIds.has(childId));
                resultItems[id] = { ...originalItem, children: filteredChildren };
            } else if (id === rootItem && !originalItem) {
                resultItems[id] = { ...baseRootItem, children: (baseRootItem.children || []).filter(childId => necessaryItemIds.has(childId)) };
            }
        });

        if (!resultItems[rootItem] && items[rootItem]) {
            resultItems[rootItem] = { ...items[rootItem], children: (items[rootItem].children || []).filter(childId => necessaryItemIds.has(childId)) };
        } else if (!resultItems[rootItem]) {
            resultItems[rootItem] = baseRootItem;
        }

        const expansionSet = new Set<TreeItemIndex>();
        necessaryItemIds.forEach(id => {
            // Check if the item in the *filtered* result has children to determine if it should be expandable
            if (resultItems[id]?.isFolder && resultItems[id]?.children && resultItems[id].children.length > 0) {
                expansionSet.add(id);
            }
        });
        if (resultItems[rootItem]?.children && resultItems[rootItem].children.length > 0) {
            expansionSet.add(rootItem);
        }

        return { filteredItems: resultItems, itemsToExpand: Array.from(expansionSet) };
    }, [searchTerm, items, rootItem]);

    // --- Expand necessary parents effect ---
    // --- Expand necessary parents effect (MODIFIED) ---
    React.useEffect(() => {
        if (searchTerm && itemsToExpand.length > 0) {
            // Add necessary expansions for search results
            setExpandedItems(prev => {
                const newExpanded = new Set(prev ?? []);
                itemsToExpand.forEach(id => newExpanded.add(id));
                // Ensure root is expanded if search yields results
                if (Object.keys(filteredItems).length > 1) {
                    newExpanded.add(rootItem);
                }
                return Array.from(newExpanded);
            });
        }
        // Ensure 'items' is included if the reset logic depends on it, which it does.
    }, [searchTerm, itemsToExpand, rootItem, filteredItems]);
    // --- End Expand Effect ---
    // --- End Expand Effect ---


    // --- Drag and Drop Handler (Adjusted types for clarity) ---
    const handleDrop: TreeChangeHandlers<ItemData>['onDrop'] = (
        draggedItems: TreeItem<ItemData>[], // Use TreeItem<ItemData> as per handler type
        target: DraggingPosition
    ) => {
        if (!draggedItems || draggedItems.length === 0) return;

        const draggedItemIds = draggedItems.map(item => item.index);
        console.log("Attempting drop:", draggedItemIds, "onto target:", target);

        setItems(prevItems => {
            let newItems = { ...prevItems };

            // --- 1. Remove dragged items from original parents (immutable update) ---
            const sourceParentUpdates: Record<TreeItemIndex, Partial<ExtendedTreeItem>> = {};
            draggedItemIds.forEach(draggedId => {
                for (const parentId in newItems) {
                    const parent = newItems[parentId];
                    if (parent.children?.includes(draggedId)) {
                        // Ensure we don't modify the same parent multiple times in this loop inefficiently
                        if (!sourceParentUpdates[parentId]) {
                            sourceParentUpdates[parentId] = {
                                children: parent.children.filter(childId => !draggedItemIds.includes(childId)) // Filter all dragged items at once
                            };
                        }
                        // Found parent, break inner loop for this draggedId
                        // Note: This break assumes an item only has one parent.
                        // If multiple parents were possible (not a tree), logic needs adjustment.
                        break;
                    }
                }
            });

            // Apply parent updates
            for (const parentId in sourceParentUpdates) {
                newItems[parentId] = { ...newItems[parentId], ...sourceParentUpdates[parentId] };
            }


            // --- 2. Insert dragged items into new location ---
            let targetParentId: TreeItemIndex;
            let insertionIndex: number | undefined = undefined;
            let isDroppingOntoItem = false;

            if (target.targetType === 'root') {
                targetParentId = target.targetItem; // Use targetItem for root
            } else if (target.targetType === 'item') {
                targetParentId = target.targetItem; // Dropping ONTO this item
                isDroppingOntoItem = true;
            } else { // 'between-items'
                targetParentId = target.parentItem;
                insertionIndex = target.childIndex;
            }

            let targetParent = newItems[targetParentId];

            if (!targetParent) {
                // Handle cases where target parent might not exist (e.g., root not in initialItems)
                if (targetParentId === rootItem && !items[rootItem]) {
                    targetParent = { index: rootItem, data: { name: 'Root', type: 'folder' }, isFolder: true, children: [] };
                    newItems[rootItem] = targetParent; // Add the root if it was missing
                } else {
                    console.error("Drop failed: Target parent container not found or invalid:", targetParentId);
                    return prevItems; // Abort if target parent is truly missing
                }
            }

            // Ensure target IS a folder if dropping ONTO it
            if (isDroppingOntoItem) {
                targetParent = {
                    ...targetParent,
                    isFolder: true, // Make it a folder
                    children: targetParent.children ?? [], // Ensure children array exists
                };
            }


            const currentChildren = targetParent.children ?? [];
            let newChildren: TreeItemIndex[];

            // Filter out items already present (should be redundant due to step 1 but safe)
            const childrenToAdd = draggedItemIds.filter(id => !currentChildren.includes(id));

            if (insertionIndex !== undefined) { // 'between-items'
                newChildren = [
                    ...currentChildren.slice(0, insertionIndex),
                    ...childrenToAdd,
                    ...currentChildren.slice(insertionIndex),
                ];
            } else { // 'item' or 'root' target type (append to end)
                newChildren = [...currentChildren, ...childrenToAdd];
            }

            // Update the target parent immutably
            newItems[targetParentId] = { ...targetParent, children: newChildren };


            console.log("Drop successful. New items state:", newItems);
            return newItems;
        });
    };
    // --- End Drag and Drop Handler ---

    // --- Rename Handler (Corrected type) ---
    const handleRename: TreeChangeHandlers<ItemData>['onRenameItem'] = (
        item: TreeItem<ItemData>, // Use TreeItem<ItemData> as per handler type
        name: string
        // treeId is also available if needed: treeId: string
    ) => {
        setItems(prev => {
            // Find the item, ensure immutability
            const currentItem = prev[item.index];
            if (!currentItem) return prev; // Item not found

            return {
                ...prev,
                [item.index]: {
                    ...currentItem,
                    // Update data immutably
                    data: { ...(currentItem.data ?? {}), name }, // Ensure data exists before spreading
                },
            };
        });
    };
    // --- End Rename Handler ---


    // --- Render Item Function (CORRECTED based on provided types) ---
    const renderTreeItem = ({
        item, // Type is TreeItem<ItemData> from environment, cast to ExtendedTreeItem if needed
        depth,
        children, // The rendered children list (ul) or null
        title,    // The rendered title (string or component)
        context,  // Correctly typed TreeItemRenderContext
    }: {
        item: TreeItem<ItemData>; // Use base type from library prop
        depth: number;
        children: React.ReactNode | null;
        title: React.ReactNode;
        context: TreeItemRenderContext;
        info: TreeInformation;
    }) => {
        const [dropDownOpen, setDropDownOpen] = React.useState<boolean>(false)
        // Cast to ExtendedTreeItem if you need custom properties like 'emoji' or specific 'type'
        const extendedItem = item as ExtendedTreeItem;
        const IconComponent = extendedItem.data.icon || defaultIcons[extendedItem.data.type] || FileText;

        // Flags available on TreeItemRenderContext (use defaults for safety)
        const isRenaming = context.isRenaming ?? false;
        const isSelected = context.isSelected ?? false;
        const isFocused = context.isFocused ?? false;
        const isExpanded = context.isExpanded ?? false;
        const isDraggingOver = context.isDraggingOver ?? false; // Dragging over this item or its vicinity
        const canDropOn = context.canDropOn ?? false; // Can the current drag operation drop *onto* this item?

        const isActive = isSelected || isFocused;

        // *** CORRECTED: Drop target highlight logic ***
        // Highlight for dropping ONTO this specific item (making it a parent)
        // Relies on context flags: dragging over this item AND it's a valid drop target *onto* it
        const isDropTargetOnto = isDraggingOver && canDropOn;
        // Highlight when dragging nearby (for reordering, not directly onto) - subtle is okay
        const isDraggingOverArea = isDraggingOver && !isDropTargetOnto;

        return (
            <SidebarMenuItem
                key={item.index}
                className={cn(
                    "rct-tree-item-li group/item relative",
                    isDraggingOverArea && "bg-muted/20",
                    isDropTargetOnto && "bg-primary/10 outline-2 outline-offset-[-1px] outline-primary rounded",
                )}
                style={{ paddingLeft: `${depth * 12}px` }}
                {...context.itemContainerWithChildrenProps}
            >
                <div
                    className={cn(
                        "flex items-center w-full h-8 px-2 rounded text-sm group/button py-2",
                        !isRenaming && "cursor-pointer hover:bg-muted",
                        isActive && !isDraggingOver && "bg-accent text-accent-foreground",
                        isDropTargetOnto && "bg-transparent",
                    )}
                    {...context.itemContainerWithoutChildrenProps}
                    {...context.interactiveElementProps}
                >
                    <div
                        className="w-4 h-4 mr-1 flex items-center justify-center shrink-0"
                        {...context.arrowProps}
                    >
                        {(item.isFolder || (item.children && item.children.length > 0)) && (
                            <ChevronRight
                                size={14}
                                className={cn(
                                    "transition-transform duration-150 text-muted-foreground/80",
                                    isExpanded && "transform rotate-90"
                                )}
                            />
                        )}
                    </div>

                    <div className="w-4 h-4 mr-1.5 flex items-center justify-center shrink-0">
                        {extendedItem.data.emoji ? (
                            <span className="text-sm select-none">{extendedItem.data.emoji}</span>
                        ) : (
                            <IconComponent
                                size={14}
                                className={cn(
                                    "shrink-0",
                                    isActive && !isDraggingOver ? "text-accent-foreground" : "text-muted-foreground/90"
                                )}
                            />
                        )}
                    </div>

                    <span className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap pr-1">
                        {isRenaming ? (
                            <input
                                type="text"
                                defaultValue={extendedItem.data.name}
                                onBlur={() => {
                                    context.stopRenamingItem();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        context.stopRenamingItem();
                                    } else if (e.key === 'Escape') {
                                        context.stopRenamingItem();
                                    }
                                }}
                                autoFocus
                                className="w-full bg-transparent outline-none ring-1 ring-inset ring-input focus:ring-ring px-1 py-0 text-sm rounded-sm"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            title
                        )}
                    </span>

                    {!isRenaming && (
                        <div className="ml-auto pl-1 opacity-0 group-hover/button:opacity-100 data-[state=open]:opacity-100">
                            <DropdownMenu open={dropDownOpen} onOpenChange={setDropDownOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost" size="icon" className="h-5 w-5"
                                        onClick={(e) => {
                                            setDropDownOpen(true)
                                            e.stopPropagation();
                                        }}
                                        aria-label="Actions"
                                    >
                                        <MoreHorizontal size={14} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-16 p-1" align="start" side="right" sideOffset={5}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex flex-col">
                                        <DropdownMenuItem>
                                            <Copy size={14} className="mr-1 text-muted-foreground" /> Duplicate
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Edit2 size={14} className="mr-1 text-muted-foreground" /> Rename
                                        </DropdownMenuItem>

                                        <hr className="my-1" />

                                        <DropdownMenuItem>
                                            <ArrowRight size={14} className="mr-1 text-muted-foreground" /> Move to...
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Link size={14} className="mr-1 text-muted-foreground" /> Copy link
                                        </DropdownMenuItem>
                                        <DropdownMenuItem variant="destructive">
                                            <Trash2 size={14} className="mr-1 text-muted-foreground" /> Delete
                                        </DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
                {children}
            </SidebarMenuItem>
        );
    };

    const renderDragBetweenLine = ({ lineProps }: {
        draggingPosition: DraggingPosition;
        lineProps: HTMLProps<HTMLDivElement>;
    }) => (
        <div
            {...lineProps}
            style={{
                ...(lineProps.style ?? {}),
                height: '2px',
                top: typeof lineProps.style?.top === 'number' ? lineProps.style.top : 0 + 3,
                width: '100%', // Ensure width is still set if needed
                position: 'absolute',
                zIndex: 9999,
                backgroundColor: 'var(--primary)', // Use your theme variable
                opacity: 0.6,
                display: 'block', // Ensure it's visible
                // Optional: Add pointer-events none if it interferes with hover
                // pointerEvents: 'none',
            }}
            // --- END OF CHANGE ---
            data-testid="rct-drag-line-debug"
            className="rct-tree-drag-between-line" // Keep original class if needed
        />
    );
    // --- End Render Drag Placeholder Line ---

    // --- Tree Capabilities (CORRECTED - removed invalid canRename function) ---
    // The main canRename flag is set directly on the environment props
    const treeCapabilities: TreeCapabilities<ItemData, never> = {
        // Check if *all* selected items are draggable (and not the root)
        canDrag: (draggedItems: TreeItem<ItemData>[]) =>
            draggedItems.every(item => {
                // Assume ExtendedTreeItem if needed for canMove
                const extendedItem = item as ExtendedTreeItem;
                return (extendedItem.canMove ?? true) && item.index !== rootItem
            }),

        // Check if the drop target is valid
        canDropAt: (draggedItems: TreeItem<ItemData>[], target: DraggingPosition): boolean => {
            const draggedItemIds = draggedItems.map(item => item.index);
            const targetItemId = getTargetItemId(target); // ID of item being dropped ONTO

            // Cannot drop onto self
            if (targetItemId !== undefined && draggedItemIds.includes(targetItemId)) {
                return false;
            }

            // Cannot drop item into its own descendant or itself
            const targetParentId = getTargetParentId(target, rootItem);
            for (const draggedItemId of draggedItemIds) {
                if (targetParentId === draggedItemId) return false; // Cannot drop into self

                // Check original 'items' state for structure
                const draggedItem = items[draggedItemId];
                if (draggedItem?.isFolder) { // Check only if the dragged item is a folder
                    // Is target parent a descendant of the dragged folder?
                    if (isDescendant(items, draggedItemId, targetParentId)) {
                        return false;
                    }
                    // Is the specific item being dropped ONTO a descendant? (Redundant check, but safe)
                    if (target.targetType === 'item' && isDescendant(items, draggedItemId, target.targetItem)) {
                        return false;
                    }
                }
            }
            return true;
        },
    };

    const handlePrimaryAction = React.useCallback((item: TreeItem<ItemData>) => {
        if (onPrimaryAction) {
            const fullItem = items[item.index] as ExtendedTreeItem;
            if (fullItem) {
                onPrimaryAction(fullItem);
            } else {
                console.warn("Primary action triggered on item not found in state:", item.index);
            }
        }
    }, [onPrimaryAction, items]);

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="uppercase text-muted-foreground/60 px-2">
                {title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <ControlledTreeEnvironment<ItemData, never>
                    ref={environmentRef}
                    items={filteredItems as ExplicitDataSource<ItemData>['items']}
                    getItemTitle={(item: TreeItem<ItemData>) => (item.data as ItemData)?.name ?? ''}
                    viewState={{
                        [treeId]: {
                            focusedItem: focusedItem,
                            expandedItems: expandedItems ?? [],
                            selectedItems: selectedItems ?? [],
                        },
                    }}
                    onFocusItem={(item) => setFocusedItem(item.index)}
                    onExpandItem={(item) => setExpandedItems(prev => [...new Set([...(prev ?? []), item.index])])}
                    onCollapseItem={(item) => setExpandedItems(prev => (prev ?? []).filter((id) => id !== item.index))}
                    onSelectItems={(items) => setSelectedItems(items)}
                    onDrop={handleDrop}
                    onRenameItem={handleRename}
                    onPrimaryAction={handlePrimaryAction}
                    canDragAndDrop={true}
                    canReorderItems={true}
                    canDropOnFolder={true}
                    canDropOnNonFolder={true}
                    {...treeCapabilities}

                    canRename={true}

                    renderItem={renderTreeItem}
                    renderDragBetweenLine={renderDragBetweenLine}

                    renderTreeContainer={({ children, containerProps }) => (
                        <div {...containerProps} className={cn("rct-tree-root pl-1 pr-1", containerProps?.className)}>
                            {children}
                        </div>
                    )}
                    renderItemsContainer={({ children, containerProps }) => (
                        <ul {...containerProps} className={cn("rct-tree-items-container", containerProps?.className)} style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
                            {children}
                        </ul>
                    )}
                >
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