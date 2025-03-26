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
    type TreeCapabilities
} from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import { ChevronRight, MoreHorizontal, FileText, Edit2, Copy, ArrowRight, EyeOff, Trash2, LockIcon } from "lucide-react";
import { cn } from "@app/ui/lib/utils";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenuItem,
} from "@app/ui/components/sidebar";
import { Button } from "@app/ui/components/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@app/ui/components/popover";
import { type ItemData, type ExtendedTreeItem, type TreeItems, defaultIcons } from "@/lib/mock/sidebar-data";

// Define our context type based on the library's, specifying 'never' for custom flags
type TreeItemRenderContext = LibraryTreeItemRenderContext<never>;

interface HierarchicalSectionProps {
    title: string;
    treeId: string;
    initialItems: TreeItems;
    rootItem?: TreeItemIndex;
    searchTerm?: string;
    onPrimaryAction?: (item: ExtendedTreeItem) => void;
}

// --- Helper functions (getTargetParentId, getTargetItemId, isDescendant) remain the same ---
function getTargetParentId(target: DraggingPosition, rootId: TreeItemIndex): TreeItemIndex {
    if (target.targetType === 'root') {
        return rootId;
    } else if (target.targetType === 'item') {
        return target.targetItem;
    } else {
        return target.parentItem;
    }
}

function getTargetItemId(target: DraggingPosition): TreeItemIndex | undefined {
    if (target.targetType === 'item' || target.targetType === 'root') {
        return target.targetItem;
    }
    return undefined;
}

function isDescendant(items: TreeItems, parentId: TreeItemIndex, potentialChildId: TreeItemIndex): boolean {
    const parent = items[parentId];
    if (!parent || !parent.children || parent.children.length === 0) {
        return false;
    }
    if (parent.children.includes(potentialChildId)) {
        return true;
    }
    return parent.children.some(childId => isDescendant(items, childId, potentialChildId));
}

// --- End Helper Functions ---

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

    const environmentRef = React.useRef<TreeEnvironmentRef<ItemData, never>>(null);

    // --- Search Logic (filteredItems, itemsToExpand) remains the same ---
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
            return {
                filteredItems: { [rootItem]: baseRootItem },
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
            necessaryItemIds.add(id);
            addAncestors(id);
        });

        const resultItems: TreeItems = {};
        necessaryItemIds.forEach(id => {
            const originalItem = items[id];
            if (originalItem) {
                const originalChildren = originalItem.children || [];
                const filteredChildren = originalChildren.filter(childId => necessaryItemIds.has(childId));
                resultItems[id] = { ...originalItem, children: filteredChildren };
            } else if (id === rootItem) {
                const originalChildren = baseRootItem.children || [];
                const filteredChildren = originalChildren.filter(childId => necessaryItemIds.has(childId));
                resultItems[id] = { ...baseRootItem, children: filteredChildren };
            }
        });

        if (!resultItems[rootItem]) {
            resultItems[rootItem] = baseRootItem;
        }

        const expansionSet = new Set<TreeItemIndex>();
        necessaryItemIds.forEach(id => {
            if (resultItems[id]?.isFolder) {
                expansionSet.add(id);
            }
        });

        return { filteredItems: resultItems, itemsToExpand: Array.from(expansionSet) };

    }, [searchTerm, items, rootItem]);
    // --- End Search Logic ---

    // --- Expand necessary parents effect remains the same ---
    React.useEffect(() => {
        if (searchTerm && itemsToExpand.length > 0) {
            setExpandedItems(prev => [...new Set([...(prev ?? []), ...itemsToExpand])]);
        }
    }, [searchTerm, itemsToExpand]);
    // --- End Expand Effect ---


    // --- Drag and Drop Handler (Operates on `items` state) ---
    const handleDrop: TreeChangeHandlers<ItemData>['onDrop'] = (draggedItems, target) => {
        if (!draggedItems || draggedItems.length === 0) return;

        const draggedItemIds = draggedItems.map(item => item.index);
        console.log("Attempting drop:", draggedItemIds, "onto target:", target);

        setItems(prevItems => {
            let newItems = { ...prevItems }; // Shallow copy

            // --- 1. Remove dragged items from their original parents ---
            const sourceParentIds = new Map<TreeItemIndex, TreeItemIndex>();
            draggedItemIds.forEach(draggedId => {
                for (const parentId in newItems) {
                    if (newItems[parentId].children?.includes(draggedId)) {
                        sourceParentIds.set(draggedId, parentId);
                        break;
                    }
                }
            });
            sourceParentIds.forEach((originalParentId, draggedId) => {
                const parent = newItems[originalParentId];
                if (parent?.children) {
                    const updatedChildren = parent.children.filter(childId => childId !== draggedId);
                    newItems[originalParentId] = { ...parent, children: updatedChildren };
                }
            });

            // --- 2. Insert dragged items into the new location ---
            const targetParentId = getTargetParentId(target, rootItem);
            let targetParent = newItems[targetParentId];

            if (!targetParent) {
                console.error("Drop failed: Target parent not found:", targetParentId);
                return prevItems; // Abort
            }

            // *** Key Change: Ensure target becomes a folder if dropping ONTO it ***
            if (target.targetType === 'item') {
                targetParent = { ...targetParent, isFolder: true, children: targetParent.children ?? [] };
                newItems[targetParentId] = targetParent; // Update the item in our map
            }

            const currentChildren = targetParent.children ?? [];
            let newChildren: TreeItemIndex[];

            if (target.targetType === 'between-items') {
                const insertionIndex = target.childIndex;
                newChildren = [
                    ...currentChildren.slice(0, insertionIndex),
                    ...draggedItemIds,
                    ...currentChildren.slice(insertionIndex),
                ];
            } else { // 'item' or 'root' target type
                const childrenToAdd = draggedItemIds.filter(id => !currentChildren.includes(id));
                newChildren = [...currentChildren, ...childrenToAdd];
            }

            newItems[targetParentId] = { ...targetParent, children: newChildren };

            console.log("Drop successful. New items state:", newItems);
            return newItems;
        });
    };
    // --- End Drag and Drop Handler ---

    // --- Rename Handler (Operates on `items` state) - remains the same ---
    const handleRename: TreeChangeHandlers<ItemData>['onRenameItem'] = (item, name) => {
        setItems(prev => {
            if (!prev[item.index]) return prev; // Item not found
            return {
                ...prev,
                [item.index]: {
                    ...prev[item.index],
                    data: { ...item.data, name },
                },
            };
        });
    };
    // --- End Rename Handler ---


    // --- Render Item Function (Corrected based on types) ---
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
        // Use the correctly typed context
        context: TreeItemRenderContext;
        info: TreeInformation;
    }) => {
        const IconComponent = item.data.icon || defaultIcons[item.data.type] || FileText;
        // Flags available on TreeItemRenderContext
        const isRenaming = context.isRenaming ?? false;
        const isSelected = context.isSelected ?? false;
        const isFocused = context.isFocused ?? false;
        const isExpanded = context.isExpanded ?? false;
        const isDraggingOver = context.isDraggingOver ?? false; // Dragging over this item or its vicinity
        const canDropOn = context.canDropOn ?? false; // Can the current drag operation drop here?

        const isActive = isSelected || isFocused;
        // Highlight for dropping ONTO this specific item
        const isDropTargetOnto = isDraggingOver && canDropOn;
        // Highlight for dragging nearby (but not directly onto, or onto is invalid)
        // This might need refinement based on visual preference.
        const isDraggingOverArea = isDraggingOver && !isDropTargetOnto;

        return (
            // Outer container for the item and its potential children list
            <SidebarMenuItem
                key={item.index}
                className={cn(
                    "rct-tree-item-li group/item relative", // Base classes
                    // Item itself being dragged styling is usually handled by browser/library defaults
                    isDraggingOverArea && "bg-muted/30", // Highlight when dragging nearby
                    isDropTargetOnto && "bg-accent/40 ring-1 ring-accent", // Highlight when dropping ONTO is valid
                )}
                style={{ paddingLeft: `${depth * 16}px` }} // Indentation
                // Props for measurement and accessibility, includes children
                {...context.itemContainerWithChildrenProps}
            >
                {/* Inner container: The interactive part (clickable, draggable) */}
                <div
                    className={cn(
                        "flex items-center w-full h-8 px-2 rounded text-sm group/button cursor-pointer", // Added cursor-pointer
                        "hover:bg-muted", // Hover effect
                        isActive && !isDraggingOver && !isDropTargetOnto && "bg-accent text-accent-foreground", // Active state
                    )}
                    // Props for measurement, accessibility, NO children
                    {...context.itemContainerWithoutChildrenProps}
                    // *** CRITICAL: Props for click, focus, drag initiation, etc. ***
                    {...context.interactiveElementProps}
                >
                    {/* Arrow */}
                    <div
                        className="w-4 h-4 mr-1 flex items-center justify-center shrink-0"
                        // Props for handling expand/collapse on arrow click
                        {...context.arrowProps}
                    >
                        {/* Always render arrow space if item CAN be a folder,
                            render arrow only if it IS a folder currently */}
                        {(item.isFolder || item.children && item.children?.length > 0) && ( // Show arrow if it IS a folder
                            <ChevronRight
                                size={14}
                                className={cn(
                                    "transition-transform duration-150 text-muted-foreground/80",
                                    isExpanded && "transform rotate-90"
                                )}
                            />
                        )}
                    </div>

                    {/* Icon/Emoji */}
                    <div className="w-4 h-4 mr-1.5 flex items-center justify-center shrink-0">
                        {item.data.emoji ? (
                            <span className="text-sm select-none">{item.data.emoji}</span>
                        ) : (
                            <IconComponent
                                size={14}
                                className={cn(
                                    "shrink-0",
                                    isActive ? "text-accent-foreground" : "text-muted-foreground/90"
                                )}
                            />
                        )}
                    </div>

                    {/* Title / Rename Input */}
                    <span className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap pr-1">
                        {isRenaming ? (
                            <input
                                type="text"
                                defaultValue={item.data.name}
                                onBlur={() => context.stopRenamingItem()}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        context.stopRenamingItem();
                                    } else if (e.key === 'Escape') {
                                        context.stopRenamingItem();
                                    }
                                }}
                                autoFocus
                                className="w-full bg-transparent outline-none border border-input px-1 py-0 text-sm rounded-sm"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            title // Render the title provided by the library
                        )}
                    </span>

                    {/* Actions on Hover */}
                    {!isRenaming && (
                        <div className="ml-auto pl-1 opacity-0 group-hover/button:opacity-100">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5"
                                        onClick={(e) => e.stopPropagation()}
                                        aria-label="Actions"
                                    >
                                        <MoreHorizontal size={14} />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-52 p-1"
                                    align="start"
                                    side="right"
                                    sideOffset={5}
                                >
                                    <div className="flex flex-col space-y-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="justify-start text-sm font-normal"
                                            onClick={() => console.log("Rename clicked")}
                                        >
                                            <Edit2 size={14} className="mr-2" />
                                            Rename
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="justify-start text-sm font-normal"
                                            onClick={() => console.log("Duplicate clicked")}
                                        >
                                            <Copy size={14} className="mr-2" />
                                            Duplicate
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="justify-start text-sm font-normal"
                                            onClick={() => console.log("Move to subpage clicked")}
                                        >
                                            <ArrowRight size={14} className="mr-2" />
                                            Move to subpage
                                        </Button>

                                        <hr className="my-1" />

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="justify-start text-sm font-normal"
                                            onClick={() => console.log("Lock clicked")}
                                        >
                                            <LockIcon size={14} className="mr-2" />
                                            Lock
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="justify-start text-sm font-normal"
                                            onClick={() => console.log("Hide clicked")}
                                        >
                                            <EyeOff size={14} className="mr-2" />
                                            Hide
                                        </Button>

                                        <hr className="my-1" />

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="justify-start text-sm font-normal text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => console.log("Delete clicked")}
                                        >
                                            <Trash2 size={14} className="mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                </div>
                {/* Render children list container provided by the library */}
                {children}
            </SidebarMenuItem>
        );
    };
    // --- End Render Item Function ---

    // --- Render Drag Placeholder Line - remains the same ---
    const renderDragBetweenLine = ({ lineProps }: {
        draggingPosition: DraggingPosition;
        lineProps: HTMLProps<HTMLDivElement>;
    }) => (
        <div
            {...lineProps}
            style={{
                ...lineProps.style,
                height: '2px',
                backgroundColor: 'hsl(var(--primary))',
            }}
            className="rct-tree-drag-between-line"
        />
    );
    // --- End Render Drag Placeholder Line ---

    // Define capabilities using the TreeCapabilities interface
    const treeCapabilities: TreeCapabilities<ItemData, never> = {
        // Check if *all* selected items are draggable (and not the root)
        canDrag: (draggedItems: ExtendedTreeItem[]) => draggedItems.every(item => (item.canMove ?? true) && item.index !== rootItem),

        // Check if the drop target is valid
        canDropAt: (draggedItems: ExtendedTreeItem[], target: DraggingPosition): boolean => {
            const draggedItemIds = draggedItems.map(item => item.index);
            const targetItemId = getTargetItemId(target);

            // 1. Cannot drop onto itself
            if (targetItemId !== undefined && draggedItemIds.includes(targetItemId)) {
                return false;
            }

            // 2. Cannot drop a folder into its own descendant
            const targetParentId = getTargetParentId(target, rootItem);
            for (const draggedItemId of draggedItemIds) {
                const draggedItem = items[draggedItemId]; // Use original items for structure check
                if (draggedItem?.isFolder) { // Check only if the dragged item is currently a folder
                    if (isDescendant(items, draggedItemId, targetParentId)) {
                        return false;
                    }
                    if (target.targetType === 'item' && isDescendant(items, draggedItemId, target.targetItem)) {
                        return false;
                    }
                }
            }

            return true;
        },
    };

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="uppercase text-muted-foreground/60 px-2">
                {title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
                {/* Use ControlledTreeEnvironment with correct types */}
                <ControlledTreeEnvironment<ItemData, never> // Data type, Custom Flags type
                    ref={environmentRef} // Type already corrected
                    items={filteredItems as ExplicitDataSource<ItemData>['items']}
                    getItemTitle={(item: ExtendedTreeItem) => item.data.name}
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
                    onPrimaryAction={onPrimaryAction}

                    // *** Core Drag & Drop Props ***
                    canDragAndDrop={true}     // Enable DnD
                    canReorderItems={true}    // Allow reordering within parent
                    canDropOnFolder={true}    // Allow dropping INTO existing folders
                    canDropOnNonFolder={true} // *** Allow dropping ONTO items (turning them into folders) ***
                    {...treeCapabilities}     // Spread canDrag/canDropAt checks
                    canRename={true}          // Enable renaming feature

                    // Renderers
                    renderItem={renderTreeItem}
                    renderDragBetweenLine={renderDragBetweenLine}
                    // Optional basic containers (can be customized further)
                    renderTreeContainer={({ children, containerProps }) => (
                        <div {...containerProps} className={cn("rct-tree-root", containerProps.className)}>
                            {children}
                        </div>
                    )}
                    renderItemsContainer={({ children, containerProps }) => (
                        <ul {...containerProps} className={cn("rct-tree-items-container", containerProps.className)} style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
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