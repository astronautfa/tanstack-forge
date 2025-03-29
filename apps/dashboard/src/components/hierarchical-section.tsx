import * as React from "react";
import type { HTMLProps } from 'react'; // Import Ref type
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
import { ChevronRight, MoreHorizontal, FileText, Edit2, Copy, ArrowRight, Trash2, Link as LinkIconLucide, Eye, Columns2 } from "lucide-react";
import { cn } from "@app/ui/lib/utils";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
} from "@app/ui/components/sidebar";
import { Button } from "@app/ui/components/button";
import { type ItemData, type ExtendedTreeItem, type TreeItems, defaultIcons } from "@/lib/mock/sidebar-data";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@app/ui/components/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from "@app/ui/components/alert-dialog";
import {
    ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger
} from "@app/ui/components/context-menu";
import { useNavigate } from "@tanstack/react-router";

type TreeItemRenderContext = LibraryTreeItemRenderContext<never>;

interface HierarchicalSectionProps {
    title: string;
    treeId: string;
    initialItems: TreeItems;
    rootItem?: TreeItemIndex;
    searchTerm?: string;
    onPrimaryAction?: (item: ExtendedTreeItem) => void; // For "Open" action
    // New props for active state highlighting
    activeItemId?: string;
    isItemActive?: (itemId: TreeItemIndex) => boolean;

    // Actions passed down from parent
    onOpenToSide?: (item: ExtendedTreeItem) => void;
    onRenameConfirm?: (item: ExtendedTreeItem, newName: string) => void; // Renamed prop
    onDuplicate?: (item: ExtendedTreeItem) => void;
    onMoveTo?: (item: ExtendedTreeItem) => void; // Placeholder
    onCopyLink?: (item: ExtendedTreeItem) => void;
    onDelete?: (item: ExtendedTreeItem) => void;
}

// --- Helper functions ---
function getTargetParentId(target: DraggingPosition, rootId: TreeItemIndex): TreeItemIndex {
    if (target.targetType === 'root') return target.targetItem;
    return target.parentItem;
}
function getTargetItemId(target: DraggingPosition): TreeItemIndex | undefined {
    if (target.targetType === 'item') return target.targetItem;
    return undefined;
}
function isDescendant(items: TreeItems, parentId: TreeItemIndex, potentialChildId: TreeItemIndex): boolean {
    const visited = new Set<TreeItemIndex>();
    const check = (currentParentId: TreeItemIndex): boolean => {
        if (visited.has(currentParentId) || currentParentId === potentialChildId) return false;
        visited.add(currentParentId);
        const parent = items[currentParentId];
        if (!parent || !Array.isArray(parent.children) || parent.children.length === 0) return false;
        if (parent.children.includes(potentialChildId)) return true;
        return parent.children.some(childId => items[childId] && check(childId));
    };
    return items[parentId] ? check(parentId) : false;
}
// --- End Helper Functions ---

const getStorageKey = (treeId: string): string => `hierarchicalSection:expandedItems:${treeId}`;

export function HierarchicalSection({
    title,
    treeId,
    initialItems,
    rootItem = "root",
    searchTerm = "",
    onPrimaryAction,
    activeItemId,
    isItemActive,
    onOpenToSide,
    onRenameConfirm, // Renamed prop
    onDuplicate,
    onMoveTo,
    onCopyLink,
    onDelete
}: HierarchicalSectionProps) {
    const [items, setItems] = React.useState<TreeItems>(initialItems);
    const [focusedItem, setFocusedItem] = React.useState<TreeItemIndex>();
    const [expandedItems, setExpandedItems] = React.useState<TreeItemIndex[]>(() => {
        const storageKey = getStorageKey(treeId);
        let defaultExpanded: TreeItemIndex[] = [];

        // Calculate default expansion (root + direct children) - only if needed
        const calculateDefaultExpansion = () => {
            const root = items[rootItem];
            const initialExpanded = new Set<TreeItemIndex>([rootItem]);
            (root?.children ?? []).forEach(childId => {
                if (items[childId]) initialExpanded.add(childId);
            });
            return Array.from(initialExpanded);
        };

        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                const savedStateString = localStorage.getItem(storageKey);
                if (savedStateString) {
                    const parsedState = JSON.parse(savedStateString);
                    // Basic validation: check if it's an array
                    if (Array.isArray(parsedState)) {
                        console.log(`[HierarchicalSection ${treeId}] Loaded expanded state from localStorage.`);
                        // You could add more validation here (e.g., check if items still exist)
                        // but react-complex-tree handles non-existent IDs gracefully.
                        return parsedState as TreeItemIndex[];
                    } else {
                        console.warn(`[HierarchicalSection ${treeId}] Invalid expanded state found in localStorage. Using default.`);
                    }
                }
            } catch (error) {
                console.error(`[HierarchicalSection ${treeId}] Error reading or parsing expanded state from localStorage:`, error);
            }
        } else {
            console.log(`[HierarchicalSection ${treeId}] SSR or no localStorage, calculating default expansion.`);
        }

        // Fallback to default calculation
        console.log(`[HierarchicalSection ${treeId}] Using default expansion.`);
        return calculateDefaultExpansion();
    });
    const [selectedItems, setSelectedItems] = React.useState<TreeItemIndex[]>([]);

    const environmentRef = React.useRef<TreeEnvironmentRef<ItemData, never>>(null);

    const navigate = useNavigate()

    // --- Filter logic (keep as is) ---
    const { filteredItems, itemsToExpand } = React.useMemo(() => {
        // ... (filtering logic remains the same) ...
        const rootExists = items[rootItem];
        const baseRootItem: ExtendedTreeItem = rootExists ? items[rootItem] : { index: rootItem, data: { name: 'Root', type: 'folder' }, isFolder: true, children: [] };
        if (!searchTerm) return { filteredItems: items, itemsToExpand: [] };
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchingItemIds = new Set<TreeItemIndex>();
        const necessaryItemIds = new Set<TreeItemIndex>([rootItem]);
        for (const itemId in items) { if (items[itemId].data.name.toLowerCase().includes(lowerSearchTerm)) matchingItemIds.add(itemId); }
        if (matchingItemIds.size === 0) { const emptyRoot = items[rootItem] ? { [rootItem]: { ...items[rootItem], children: [] } } : { [rootItem]: baseRootItem }; return { filteredItems: emptyRoot, itemsToExpand: [rootItem] }; }
        const addAncestors = (itemId: TreeItemIndex) => { if (itemId === rootItem || necessaryItemIds.has(itemId)) return; necessaryItemIds.add(itemId); for (const potentialParentId in items) { if (items[potentialParentId].children?.includes(itemId)) { addAncestors(potentialParentId); break; } } };
        matchingItemIds.forEach(id => addAncestors(id));
        const resultItems: TreeItems = {};
        necessaryItemIds.forEach(id => { const originalItem = items[id]; if (originalItem) { const originalChildren = originalItem.children || []; const filteredChildren = originalChildren.filter(childId => necessaryItemIds.has(childId)); resultItems[id] = { ...originalItem, children: filteredChildren }; } else if (id === rootItem && !originalItem) { resultItems[id] = { ...baseRootItem, children: (baseRootItem.children || []).filter(childId => necessaryItemIds.has(childId)) }; } });
        if (!resultItems[rootItem] && items[rootItem]) { resultItems[rootItem] = { ...items[rootItem], children: (items[rootItem].children || []).filter(childId => necessaryItemIds.has(childId)) }; } else if (!resultItems[rootItem]) { resultItems[rootItem] = baseRootItem; }
        const expansionSet = new Set<TreeItemIndex>();
        necessaryItemIds.forEach(id => { if (resultItems[id]?.isFolder && resultItems[id]?.children && resultItems[id].children.length > 0) expansionSet.add(id); });
        if (resultItems[rootItem]?.children && resultItems[rootItem].children.length > 0) expansionSet.add(rootItem);
        return { filteredItems: resultItems, itemsToExpand: Array.from(expansionSet) };
    }, [searchTerm, items, rootItem]);

    // --- Expand effect (keep as is) ---
    React.useEffect(() => {
        // ... (expansion effect remains the same) ...
        if (searchTerm && itemsToExpand.length > 0) {
            setExpandedItems(prev => {
                const newExpanded = new Set(prev ?? []);
                itemsToExpand.forEach(id => newExpanded.add(id));
                if (Object.keys(filteredItems).length > 1) newExpanded.add(rootItem);
                return Array.from(newExpanded);
            });
        }
    }, [searchTerm, itemsToExpand, rootItem, filteredItems]);

    React.useEffect(() => {
        const storageKey = getStorageKey(treeId);
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(expandedItems));
                console.log(`[HierarchicalSection ${treeId}] Saved expanded state to localStorage.`);
            } catch (error) {
                console.error(`[HierarchicalSection ${treeId}] Error saving expanded state to localStorage:`, error);
            }
        }
    }, [expandedItems, treeId]);

    // --- Internal Drag and Drop Handler (keep as is) ---
    const handleDrop: TreeChangeHandlers<ItemData>['onDrop'] = (draggedItems, target) => {
        // ... (internal DND logic remains the same) ...
        if (!draggedItems || draggedItems.length === 0) return;
        const draggedItemIds = draggedItems.map(item => item.index);
        setItems(prevItems => {
            let newItems = { ...prevItems };
            const sourceParentUpdates: Record<TreeItemIndex, Partial<ExtendedTreeItem>> = {};
            draggedItemIds.forEach(draggedId => { for (const parentId in newItems) { const parent = newItems[parentId]; if (parent.children?.includes(draggedId)) { if (!sourceParentUpdates[parentId]) { sourceParentUpdates[parentId] = { children: parent.children.filter(childId => !draggedItemIds.includes(childId)) }; } break; } } });
            for (const parentId in sourceParentUpdates) { newItems[parentId] = { ...newItems[parentId], ...sourceParentUpdates[parentId] }; }
            let targetParentId: TreeItemIndex; let insertionIndex: number | undefined = undefined; let isDroppingOntoItem = false;
            if (target.targetType === 'root') targetParentId = target.targetItem; else if (target.targetType === 'item') { targetParentId = target.targetItem; isDroppingOntoItem = true; } else { targetParentId = target.parentItem; insertionIndex = target.childIndex; }
            let targetParent = newItems[targetParentId];
            if (!targetParent) { if (targetParentId === rootItem && !items[rootItem]) { targetParent = { index: rootItem, data: { name: 'Root', type: 'folder' }, isFolder: true, children: [] }; newItems[rootItem] = targetParent; } else { console.error("Drop failed: Target parent container not found or invalid:", targetParentId); return prevItems; } }
            if (isDroppingOntoItem) targetParent = { ...targetParent, isFolder: true, children: targetParent.children ?? [] };
            const currentChildren = targetParent.children ?? []; let newChildren: TreeItemIndex[]; const childrenToAdd = draggedItemIds.filter(id => !currentChildren.includes(id));
            if (insertionIndex !== undefined) newChildren = [...currentChildren.slice(0, insertionIndex), ...childrenToAdd, ...currentChildren.slice(insertionIndex)]; else newChildren = [...currentChildren, ...childrenToAdd];
            newItems[targetParentId] = { ...targetParent, children: newChildren };
            return newItems;
        });
    };

    // --- Rename Handler (Uses passed prop onRenameConfirm) ---
    const handleRename: TreeChangeHandlers<ItemData>['onRenameItem'] = (item, name) => {
        const fullItem = items[item.index];
        if (!fullItem || fullItem.data.name === name) return; // No change or item not found

        // Optimistically update local state
        setItems(prev => ({
            ...prev,
            [item.index]: {
                ...fullItem,
                data: { ...fullItem.data, name },
            },
        }));

        // Call the passed prop to handle backend update/validation
        if (onRenameConfirm) {
            onRenameConfirm(fullItem, name);
            // TODO: Consider adding error handling here if onRenameConfirm fails
            // and potentially revert the optimistic update.
        } else {
            console.warn("onRenameConfirm prop not provided to HierarchicalSection");
        }
    };

    // --- Render Item Function ---
    const renderTreeItem = ({ item, depth, children, title, context, info }: {
        item: TreeItem<ItemData>; depth: number; children: React.ReactNode | null; title: React.ReactNode; context: TreeItemRenderContext; info: TreeInformation;
    }) => {
        const extendedItem = item as ExtendedTreeItem;
        const IconComponent = extendedItem.data.icon || defaultIcons[extendedItem.data.type] || FileText;
        const isActive = isItemActive ? isItemActive(item.index) : (context.isSelected || context.isFocused || String(item.index) === activeItemId);
        const isItemRenaming = context.isRenaming ?? false;

        // --- Click Handlers ---
        const handleChevronClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (context.isExpanded) context.collapseItem(); else context.expandItem();
        };
        // Inside your sidebar's item click handler...
        const handleItemClick = (item: ExtendedTreeItem) => {
            console.log("Tree item clicked:", item.index, item.data.name); // Keep for debugging

            const iconName = typeof item.data.icon === 'string'
                ? item.data.icon
                : (item.data.icon as any)?.displayName // Attempt to get name if it's a component
                ?? undefined;

            console.log(`Navigating to /view/${item.index} with type: ${item.data.type}`);
            navigate({
                to: '/view/$itemId',
                params: { itemId: item.index as string },
                search: {
                    name: item.data.name,
                    type: item.data.type, // Pass 'folder', 'document', etc.
                    icon: iconName
                },
                replace: false // Use false generally unless you specifically want to replace history
            });
        };

        // --- Menu Item Actions ---
        const menuActions = {
            open: () => onPrimaryAction?.(extendedItem),
            openToSide: () => onOpenToSide?.(extendedItem),
            rename: () => context.startRenamingItem(), // Use context to trigger rename UI
            duplicate: () => onDuplicate?.(extendedItem),
            moveTo: () => onMoveTo?.(extendedItem),
            copyLink: () => onCopyLink?.(extendedItem),
            delete: () => onDelete?.(extendedItem), // Will trigger AlertDialog
        };

        // --- Menu Rendering ---
        const renderMenuItems = (isContextMenu = false) => (
            <>
                <ContextMenuItem key="open" onSelect={menuActions.open} disabled={!onPrimaryAction}>
                    <Eye size={14} className="mr-2 text-muted-foreground" /> Open
                </ContextMenuItem>
                <ContextMenuItem key="open-side" onSelect={menuActions.openToSide} disabled={!onOpenToSide}>
                    <Columns2 size={14} className="mr-2 text-muted-foreground" /> Open to Side
                </ContextMenuItem>
                <ContextMenuSeparator key="sep1" />
                <ContextMenuItem key="rename" onSelect={menuActions.rename} disabled={!item.canRename || !onRenameConfirm}>
                    <Edit2 size={14} className="mr-2 text-muted-foreground" /> Rename
                </ContextMenuItem>
                <ContextMenuItem key="duplicate" onSelect={menuActions.duplicate} disabled={!onDuplicate}>
                    <Copy size={14} className="mr-2 text-muted-foreground" /> Duplicate
                </ContextMenuItem>
                <ContextMenuItem key="move" onSelect={menuActions.moveTo} disabled={!onMoveTo}>
                    <ArrowRight size={14} className="mr-2 text-muted-foreground" /> Move to...
                </ContextMenuItem>
                <ContextMenuItem key="copy-link" onSelect={menuActions.copyLink} disabled={!onCopyLink}>
                    <LinkIconLucide size={14} className="mr-2 text-muted-foreground" /> Copy link
                </ContextMenuItem>
                <ContextMenuSeparator key="sep2" />
                {/* Use AlertDialogTrigger within ContextMenuItem for delete */}
                <AlertDialogTrigger asChild>
                    <ContextMenuItem key="delete" variant="destructive" disabled={!onDelete}>
                        <Trash2 size={14} className="mr-2 text-muted-foreground" /> Delete
                    </ContextMenuItem>
                </AlertDialogTrigger>
            </>
        );

        // Convert ContextMenuItems to DropdownMenuItems for the Dropdown
        const renderDropdownItems = () => (
            <>
                <DropdownMenuItem onClick={menuActions.open} disabled={!onPrimaryAction}>
                    <Eye size={14} className="mr-2 text-muted-foreground" /> Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={menuActions.openToSide} disabled={!onOpenToSide}>
                    <Columns2 size={14} className="mr-2 text-muted-foreground" /> Open to Side
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); menuActions.rename(); }} disabled={!item.canRename || !onRenameConfirm}>
                    <Edit2 size={14} className="mr-2 text-muted-foreground" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={menuActions.duplicate} disabled={!onDuplicate}>
                    <Copy size={14} className="mr-2 text-muted-foreground" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={menuActions.moveTo} disabled={!onMoveTo}>
                    <ArrowRight size={14} className="mr-2 text-muted-foreground" /> Move to...
                </DropdownMenuItem>
                <DropdownMenuItem onClick={menuActions.copyLink} disabled={!onCopyLink}>
                    <LinkIconLucide size={14} className="mr-2 text-muted-foreground" /> Copy link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem variant="destructive" disabled={!onDelete}>
                        <Trash2 size={14} className="mr-2 text-muted-foreground" /> Delete
                    </DropdownMenuItem>
                </AlertDialogTrigger>
            </>
        );


        return (
            // Use a simple li for structure, context menu wraps the interactive part
            <li
                className={cn(
                    "rct-tree-item-li relative list-none py-0 pl-0 pr-1", // Basic list item styling
                    context.isDraggingOver && !context.canDropOn && "bg-muted/20",
                    context.isDraggingOver && context.canDropOn && "bg-primary/10 outline-2 outline-offset-[-1px] outline-primary rounded",
                )}
                style={{ paddingLeft: `${depth * 12}px` }}
                {...context.itemContainerWithChildrenProps} // Important for tree structure and drag-over previews
            >
                {/* Wrap interactive part with ContextMenuTrigger and AlertDialog */}
                <AlertDialog>
                    <ContextMenu>
                        <ContextMenuTrigger asChild>
                            {/* Main clickable/draggable area */}
                            <div
                                className={cn(
                                    "flex items-center w-full h-8 px-2 rounded text-sm group/button",
                                    !isItemRenaming && "cursor-pointer hover:bg-muted",
                                    isActive && !context.isDraggingOver && "bg-accent text-accent-foreground",
                                )}
                                {...context.itemContainerWithoutChildrenProps}
                                {...context.interactiveElementProps}
                                onClick={() => handleItemClick(item)}
                                // Context menu is handled by the wrapper
                                draggable={!isItemRenaming && item.canMove} // Internal DND still possible
                            // Removed external onDragStart
                            >
                                {/* Chevron */}
                                <div
                                    className="w-4 h-4 mr-1 flex items-center justify-center shrink-0 cursor-pointer hover:bg-muted/50 rounded-sm"
                                    {...context.arrowProps}
                                    onClick={handleChevronClick}
                                >
                                    {(item.isFolder || (item.children && item.children.length > 0)) && (
                                        <ChevronRight
                                            size={14}
                                            className={cn("transition-transform duration-150 text-muted-foreground/80", context.isExpanded && "transform rotate-90")}
                                        />
                                    )}
                                </div>
                                {/* Icon */}
                                <div className="w-4 h-4 mr-1.5 flex items-center justify-center shrink-0">
                                    {extendedItem.data.emoji ? (<span className="text-sm select-none">{extendedItem.data.emoji}</span>) : (
                                        <IconComponent size={14} className={cn("shrink-0", isActive && !context.isDraggingOver ? "text-accent-foreground" : "text-muted-foreground/90")} />
                                    )}
                                </div>
                                {/* Title or Rename Input */}
                                <span className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap pr-1">
                                    {isItemRenaming ? (
                                        <input
                                            type="text"
                                            defaultValue={extendedItem.data.name}
                                            // Stop renaming on blur
                                            onBlur={() => context.stopRenamingItem()}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') { e.preventDefault(); context.stopRenamingItem(); }
                                                else if (e.key === 'Escape') context.stopRenamingItem();
                                            }}
                                            autoFocus
                                            className="w-full bg-transparent outline-none ring-1 ring-inset ring-input focus:ring-primary px-1 py-0 text-sm rounded-sm"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (title)}
                                </span>
                                {/* Hover Dropdown Trigger */}
                                {!isItemRenaming && (
                                    <div className="ml-auto pl-1 opacity-0 group-hover/button:opacity-100 group-focus-within/button:opacity-100">
                                        <DropdownMenu> {/* Set modal={false} if AlertDialog is used inside */}
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} aria-label="Actions">
                                                    <MoreHorizontal size={14} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-48" align="start" side="right" sideOffset={5} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                                                {renderDropdownItems()}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}
                            </div>
                        </ContextMenuTrigger>
                        {/* Context Menu Content */}
                        <ContextMenuContent className="w-48">
                            {renderMenuItems(true)}
                        </ContextMenuContent>
                    </ContextMenu>

                    {/* Delete Confirmation Dialog Content */}
                    <AlertDialogContent onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete "{extendedItem.data.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction variant="destructive" onClick={menuActions.delete}>
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Render Children with Animation */}
                <AnimatePresence initial={false}>
                    {context.isExpanded && children && (
                        <motion.div
                            key="children"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden pl-3"
                        >
                            {children}
                        </motion.div>
                    )}
                </AnimatePresence>
            </li>
        );
    };

    // --- Render Drag Placeholder Line (keep as is) ---
    const renderDragBetweenLine = ({ lineProps }: { draggingPosition: DraggingPosition; lineProps: HTMLProps<HTMLDivElement>; }) => (
        <div {...lineProps} style={{ ...lineProps.style, height: '2px', top: `${(lineProps.style?.top as number ?? 0) + 1}px`, width: '100%', position: 'absolute', zIndex: 9999, backgroundColor: 'var(--primary)', opacity: 0.6, display: 'block' }} className="rct-tree-drag-between-line" />
    );

    // --- Tree Capabilities (keep as is for internal DND) ---
    const treeCapabilities: TreeCapabilities<ItemData, never> = {
        canDrag: (draggedItems) => draggedItems.every(item => (item as ExtendedTreeItem).canMove !== false && item.index !== rootItem),
        canDropAt: (draggedItems, target) => { /* ... internal drop validation ... */
            const draggedItemIds = draggedItems.map(item => item.index);
            const targetItemId = getTargetItemId(target);
            if (targetItemId !== undefined && draggedItemIds.includes(targetItemId)) return false;
            const targetParentId = getTargetParentId(target, rootItem);
            for (const draggedItemId of draggedItemIds) {
                if (targetParentId === draggedItemId) return false;
                const draggedItem = items[draggedItemId];
                if (draggedItem?.isFolder) {
                    if (isDescendant(items, draggedItemId, targetParentId)) return false;
                    if (target.targetType === 'item' && isDescendant(items, draggedItemId, target.targetItem)) return false;
                }
            }
            return true;
        },
        // canRename: true // This is set directly on ControlledTreeEnvironment
    };

    // --- Primary Action Callback (keep as is) ---
    const handlePrimaryActionCallback = React.useCallback((item: TreeItem<ItemData>) => {
        if (onPrimaryAction) {
            const fullItem = items[item.index] as ExtendedTreeItem;
            if (fullItem) onPrimaryAction(fullItem);
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
                            // renamingItem is managed internally by the library
                        },
                    }}
                    onFocusItem={(item) => setFocusedItem(item.index)}
                    onExpandItem={(item) => setExpandedItems(prev => [...new Set([...(prev ?? []), item.index])])}
                    onCollapseItem={(item) => setExpandedItems(prev => (prev ?? []).filter((id) => id !== item.index))}
                    onSelectItems={(items) => setSelectedItems(items)}
                    onDrop={handleDrop} // Handles internal drops
                    onRenameItem={handleRename} // Handles rename confirmation
                    onPrimaryAction={handlePrimaryActionCallback} // Handles item click
                    canDragAndDrop={true} // Enable internal DND
                    canReorderItems={true}
                    canDropOnFolder={true}
                    canDropOnNonFolder={false}
                    {...treeCapabilities}
                    canRename={true} // Enable rename capability

                    renderItem={renderTreeItem}
                    renderDragBetweenLine={renderDragBetweenLine}

                    renderTreeContainer={({ children, containerProps }) => (<div {...containerProps} className={cn("rct-tree-root pl-1 pr-1", containerProps?.className)}>{children}</div>)}
                    renderItemsContainer={({ children, containerProps }) => (<ul {...containerProps} className={cn("rct-tree-items-container m-0 list-none p-0", containerProps?.className)}>{children}</ul>)}
                >
                    <Tree treeId={treeId} rootItem={String(rootItem)} treeLabel={title} />
                </ControlledTreeEnvironment>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}