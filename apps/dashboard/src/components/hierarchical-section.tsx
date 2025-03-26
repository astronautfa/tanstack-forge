import * as React from "react";
import type { HTMLProps, Ref } from 'react'; // Added Ref
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
    type TreeItem, // Import TreeItem type
} from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import { ChevronRight, MoreHorizontal, FileText, Edit2, Copy, ArrowRight, EyeOff, Trash2, LockIcon, Link } from "lucide-react";
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
// Assuming these types are defined correctly elsewhere
import { type ItemData, type ExtendedTreeItem, type TreeItems, defaultIcons } from "@/lib/mock/sidebar-data";

// Use the type provided by the library directly
type TreeItemRenderContext = LibraryTreeItemRenderContext<never>;

interface HierarchicalSectionProps {
    title: string;
    treeId: string;
    initialItems: TreeItems; // Assuming TreeItems is Record<TreeItemIndex, ExtendedTreeItem>
    rootItem?: TreeItemIndex;
    searchTerm?: string;
    onPrimaryAction?: (item: ExtendedTreeItem) => void; // Keep ExtendedTreeItem if your handler needs it
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
        // Default expansion logic (same as before)
        const root = items[rootItem];
        const initialExpanded = new Set<TreeItemIndex>([rootItem]);
        (root?.children ?? []).forEach(childId => {
            if (items[childId]) {
                initialExpanded.add(childId);
            }
        });
        return Array.from(initialExpanded);
    });
    const [selectedItems, setSelectedItems] = React.useState<TreeItemIndex[]>([]);

    const environmentRef = React.useRef<TreeEnvironmentRef<ItemData, never>>(null);

    // --- Search Logic (filteredItems, itemsToExpand) ---
    // Assuming this logic is correct based on your needs, no changes based on errors provided
    const { filteredItems, itemsToExpand } = React.useMemo(() => {
        // ... (search logic remains the same as your previous working version) ...
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
        const necessaryItemIds = new Set<TreeItemIndex>([rootItem]); // Always include root

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
            const itemToCheck = items[id] ?? (id === rootItem ? baseRootItem : undefined);
            if (itemToCheck?.isFolder || (itemToCheck?.children && itemToCheck.children.length > 0)) {
                if (resultItems[id]?.children && resultItems[id].children.length > 0) {
                    expansionSet.add(id);
                } else if (id === rootItem && resultItems[rootItem]?.children && resultItems[rootItem].children.length > 0) {
                    expansionSet.add(id);
                }
            }
        });
        if (resultItems[rootItem]?.children && resultItems[rootItem].children.length > 0) {
            expansionSet.add(rootItem);
        }

        return { filteredItems: resultItems, itemsToExpand: Array.from(expansionSet) };
    }, [searchTerm, items, rootItem]);
    // --- End Search Logic ---

    // --- Expand necessary parents effect ---
    // --- Expand necessary parents effect (MODIFIED) ---
    const prevSearchTermRef = React.useRef(searchTerm);
    React.useEffect(() => {
        const prevSearchTerm = prevSearchTermRef.current;

        // Logic for applying expansion when search term is active
        if (searchTerm && itemsToExpand.length > 0) {
            setExpandedItems(prev => {
                const newExpanded = new Set(prev ?? []);
                itemsToExpand.forEach(id => newExpanded.add(id));
                // Ensure root is expanded if search yields results/folders under it
                if (Object.keys(filteredItems).length > 1 || (filteredItems[rootItem]?.children?.length ?? 0) > 0) {
                    newExpanded.add(rootItem);
                }
                return Array.from(newExpanded);
            });
        }
        // Logic for resetting expansion ONLY when search is CLEARED (transitioned to empty)
        else if (!searchTerm && prevSearchTerm) { // <-- Check if search *became* empty
            // Reset expansion to default (root + direct children)
            const root = items[rootItem]; // Read from current items state
            const defaultExpanded = new Set<TreeItemIndex>([rootItem]);
            (root?.children ?? []).forEach(childId => {
                if (items[childId]) { // Check against current items
                    defaultExpanded.add(childId);
                }
            });
            setExpandedItems(Array.from(defaultExpanded));
        }
        // Else: If search term is empty and was already empty, or if search yields no results to expand, DO NOTHING to expandedItems state.

        // Update the ref *after* using the previous value
        prevSearchTermRef.current = searchTerm;

        // Ensure 'items' is included if the reset logic depends on it, which it does.
    }, [searchTerm, itemsToExpand, rootItem, filteredItems, items]);
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
        info      // Correctly typed TreeInformation
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
            // Outer container (li)
            <SidebarMenuItem
                key={item.index}
                className={cn(
                    "rct-tree-item-li group/item relative", // Base classes
                    // Remove isDragging style - library handles drag preview
                    isDraggingOverArea && "bg-muted/20", // Subtle highlight when dragging nearby
                    // More prominent highlight for dropping ONTO
                    isDropTargetOnto && "bg-primary/10 outline-2 outline-offset-[-1px] outline-primary/30 rounded",
                )}
                style={{ paddingLeft: `${depth * 16}px` }}
                {...context.itemContainerWithChildrenProps} // Props for the <li> wrapper
            >
                {/* Inner container (div): Interactive row */}
                <div
                    className={cn(
                        "flex items-center w-full h-8 px-2 rounded text-sm group/button",
                        !isRenaming && "cursor-pointer hover:bg-muted",
                        isActive && !isDraggingOver && "bg-accent text-accent-foreground",
                        isDropTargetOnto && "bg-transparent", // Avoid double background
                    )}
                    {...context.itemContainerWithoutChildrenProps} // Props for the inner <div>
                    {...context.interactiveElementProps} // Click, drag handle, focus props
                >
                    {/* Arrow */}
                    <div
                        className="w-4 h-4 mr-1 flex items-center justify-center shrink-0"
                        {...context.arrowProps} // Expand/collapse props
                    >
                        {/* Render arrow if it's potentially a folder */}
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

                    {/* Icon */}
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

                    {/* Title / Rename Input */}
                    <span className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap pr-1">
                        {isRenaming ? (
                            <input
                                type="text"
                                // Use defaultValue, library handles state via onRenameItem
                                defaultValue={extendedItem.data.name}
                                onBlur={() => {
                                    // Stop renaming; library calls onRenameItem if value changed OR onAbortRenamingItem
                                    context.stopRenamingItem();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        // Stop renaming, triggering save via onRenameItem
                                        context.stopRenamingItem();
                                    } else if (e.key === 'Escape') {
                                        // Stop renaming, triggering abort via onAbortRenamingItem
                                        context.stopRenamingItem();
                                    }
                                }}
                                autoFocus
                                className="w-full bg-transparent outline-none ring-1 ring-inset ring-input focus:ring-ring px-1 py-0 text-sm rounded-sm"
                                onClick={(e) => e.stopPropagation()} // Prevent item selection
                            />
                        ) : (
                            title // Render the title provided by the library
                        )}
                    </span>

                    {/* Actions Menu (only if not renaming) */}
                    {!isRenaming && (
                        // --- Replace the className of the div wrapping Popover ---
                        <div className="ml-auto pl-1 opacity-0 group-hover/button:opacity-100 data-[state=open]:opacity-100">
                            {/* Popover component remains the same inside */}
                            <Popover open={dropDownOpen} onOpenChange={setDropDownOpen}>
                                <PopoverTrigger asChild>
                                    {/* Button remains the same */}
                                    <Button
                                        variant="ghost" size="icon" className="h-5 w-5"
                                        onClick={(e) => {
                                            setDropDownOpen(true)
                                            e.stopPropagation(); // Keep this to prevent item selection/focus
                                        }}
                                        aria-label="Actions"
                                    >
                                        <MoreHorizontal size={14} />
                                    </Button>
                                </PopoverTrigger>
                                {/* PopoverContent remains the same */}
                                <PopoverContent
                                    className="w-52 p-1" align="start" side="right" sideOffset={5}
                                    // Optional: Keep stopPropagation if clicks inside content were causing issues
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex flex-col space-y-0.5"> {/* Reduced space */}
                                        <Button variant="ghost" size="sm" className="justify-start text-sm font-normal h-7 px-2">
                                            <Trash2 size={14} className="mr-2 text-muted-foreground" /> Delete
                                        </Button>
                                        <Button variant="ghost" size="sm" className="justify-start text-sm font-normal h-7 px-2">
                                            <Copy size={14} className="mr-2 text-muted-foreground" /> Duplicate
                                        </Button>
                                        <Button variant="ghost" size="sm" className="justify-start text-sm font-normal h-7 px-2">
                                            <Edit2 size={14} className="mr-2 text-muted-foreground" /> Rename
                                        </Button>

                                        <hr className="my-1" />

                                        <Button variant="ghost" size="sm" className="justify-start text-sm font-normal h-7 px-2">
                                            <ArrowRight size={14} className="mr-2 text-muted-foreground" /> Move to...
                                        </Button>
                                        <Button variant="ghost" size="sm" className="justify-start text-sm font-normal h-7 px-2">
                                            <Link size={14} className="mr-2 text-muted-foreground" /> Copy link
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                </div>
                {/* Render children list (ul) passed by the library */}
                {children}
            </SidebarMenuItem>
        );
    };
    // --- End Render Item Function ---

    // --- Render Drag Placeholder Line (Visibility Enhanced) ---
    // This function signature matches the types provided
    const renderDragBetweenLine = ({ lineProps, draggingPosition }: {
        draggingPosition: DraggingPosition;
        lineProps: HTMLProps<HTMLDivElement>;
    }) => (
        <div
            {...lineProps} // Base props including calculated style (top, left, width)
            style={{
                // Spread the library's calculated styles first
                ...lineProps.style,
                // *** Force Visibility Styles ***
                height: '2px', // Make it thicker for debugging visibility
                width: '100%',
                position: 'absolute', // Ensure absolute positioning (should be default)
                zIndex: 9999, // Use an extremely high z-index to rule out stacking issues
                // Optional: Add a border for more visibility during debugging
                backgroundColor: 'var(--primary)',
                // border: '1px solid hsl(var(--primary))',
                // Ensure it's not transparent
                opacity: 0.6,
                // Ensure it's displayed
                display: 'block',
            }}
            // You can add a specific data attribute for easier CSS debugging in browser dev tools
            data-testid="rct-drag-line-debug"
            // Keep the library class, but our inline styles should override
            className="rct-tree-drag-between-line"
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
            return true; // Default allow if no rules broken
        },
        // canRename is now a prop on ControlledTreeEnvironment
    };

    // Type cast for onPrimaryAction if it expects ExtendedTreeItem
    const handlePrimaryAction = React.useCallback((item: TreeItem<ItemData>) => {
        if (onPrimaryAction) {
            // You might need to fetch the full ExtendedTreeItem from your state
            // if onPrimaryAction truly needs more data than TreeItem<ItemData> provides
            const fullItem = items[item.index] as ExtendedTreeItem;
            if (fullItem) {
                onPrimaryAction(fullItem);
            } else {
                console.warn("Primary action triggered on item not found in state:", item.index);
                // Fallback or alternative action if needed
            }
        }
    }, [onPrimaryAction, items]);

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="uppercase text-muted-foreground/60 px-2">
                {title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
                {/* ControlledTreeEnvironment with corrected props */}
                <ControlledTreeEnvironment<ItemData, never>
                    ref={environmentRef}
                    items={filteredItems as ExplicitDataSource<ItemData>['items']} // Cast needed if filteredItems doesn't exactly match
                    getItemTitle={(item: TreeItem<ItemData>) => (item.data as ItemData)?.name ?? ''} // Use base TreeItem type
                    viewState={{
                        [treeId]: {
                            focusedItem: focusedItem,
                            expandedItems: expandedItems ?? [],
                            selectedItems: selectedItems ?? [],
                        },
                    }}
                    // Handlers (ensure types match TreeChangeHandlers)
                    onFocusItem={(item) => setFocusedItem(item.index)}
                    onExpandItem={(item) => setExpandedItems(prev => [...new Set([...(prev ?? []), item.index])])}
                    onCollapseItem={(item) => setExpandedItems(prev => (prev ?? []).filter((id) => id !== item.index))}
                    onSelectItems={(items) => setSelectedItems(items)} // items is TreeItemIndex[]
                    onDrop={handleDrop}
                    onRenameItem={handleRename}
                    // Use the wrapped handler for onPrimaryAction
                    onPrimaryAction={handlePrimaryAction}

                    // Drag & Drop configuration
                    canDragAndDrop={true}
                    canReorderItems={true}
                    canDropOnFolder={true}
                    canDropOnNonFolder={true} // Allows dropping ON items
                    {...treeCapabilities}     // Spread corrected canDrag/canDropAt

                    // *** CORRECTED: Renaming enabled via boolean prop ***
                    canRename={true}

                    // Renderers
                    renderItem={renderTreeItem}
                    renderDragBetweenLine={renderDragBetweenLine} // Use the enhanced line renderer

                    // Container renderers (optional customization)
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
                // *** REMOVED renderDraggingItem={...} as it's not a valid prop ***
                >
                    {/* Tree component itself */}
                    <Tree
                        treeId={treeId}
                        rootItem={String(rootItem)} // Ensure rootItem is string if needed
                        treeLabel={title}
                    />
                </ControlledTreeEnvironment>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}