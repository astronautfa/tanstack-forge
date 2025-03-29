// src/lib/store/useLayoutStore.ts

import { create } from 'zustand';
import {
    Actions,
    DockLocation,
    Layout,
    Model,
    Node,
    TabNode,
    TabSetNode,
    type IJsonModel,
    type IJsonTabNode,
    BorderNode
} from '@app/layout';

// Define the structure for tab data we want to manage
export interface TabData {
    id: string;
    name: string;
    component: string; // Corresponds to the component type (e.g., 'document', 'library-item')
    icon?: string; // Name of the Lucide icon (e.g., 'FileText', 'Book')
    // Add any other specific data needed per tab type later
    // e.g., documentId, libraryItemId
}

interface LayoutState {
    layoutRef: Layout | null;
    model: Model;
    tabs: Map<string, TabData>; // Store minimal tab data for reference
    activeTabId?: string;

    // Actions
    setLayoutRef: (layout: Layout | null) => void;
    setModel: (model: Model) => void; // Use cautiously, prefer actions
    setActiveTabId: (tabId: string | undefined) => void;
    addTab: (tabData: TabData, location?: DockLocation, select?: boolean) => TabNode | undefined; // Return added node
    selectTab: (tabId: string) => void;
    removeTab: (tabId: string) => string | undefined; // Return next active tabId
    renameTab: (tabId: string, newName: string) => void;
    persistLayout: () => void; // Action to trigger saving
    // Add more actions later (openToSide, closeOtherTabs etc.)
}

// Define the initial layout structure (fallback)
const initialLayoutJson: IJsonModel = {
    global: {
        tabEnableClose: true,
        tabSetEnableDrag: true,
        tabSetEnableDrop: true,
        tabEnableRename: false, // We'll handle rename via our store action
        tabSetEnableMaximize: true,
        splitterSize: 2, // Thinner splitter
        tabSetEnableSingleTabStretch: true, // Enable stretch for single tab
        borderSize: 0, // Hide borders initially if not used
    },
    borders: [],
    layout: {
        type: 'row',
        id: '#root-row', // Give root an ID
        weight: 100,
        children: [
            {
                type: 'tabset',
                id: '#main-tabset', // Give the main tabset an ID
                weight: 100,
                children: [], // Start empty
                active: true,
            },
        ],
    },
};

// --- NEW: Define the localStorage key ---
const LAYOUT_STORAGE_KEY = 'flexlayout:model';

// --- Function to load the model ---
const loadModelFromStorage = (): { model: Model, initialTabs: Map<string, TabData> } => {
    const initialTabs = new Map<string, TabData>();
    let loadedModel: Model | null = null;

    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            const savedLayoutJsonString = localStorage.getItem(LAYOUT_STORAGE_KEY);
            if (savedLayoutJsonString) {
                const savedLayoutJson: IJsonModel = JSON.parse(savedLayoutJsonString);

                // Validate basic structure (optional but recommended)
                if (savedLayoutJson && savedLayoutJson.layout && savedLayoutJson.global) {
                    // Try creating the model from the saved JSON
                    loadedModel = Model.fromJson(savedLayoutJson);
                    console.log("[LayoutStore] Successfully loaded layout from localStorage.");

                    // --- NEW: Populate initialTabs from the loaded model ---
                    loadedModel.visitNodes((node) => {
                        if (node instanceof TabNode) {
                            const tabData: TabData = {
                                id: node.getId(),
                                name: node.getName(),
                                component: node.getComponent() || 'unknown', // Fallback needed?
                                icon: node.getIcon(),
                                // Retrieve other data from node.getConfig() if needed
                            };
                            initialTabs.set(node.getId(), tabData);
                        }
                    });
                    // --- End NEW ---

                } else {
                    console.warn("[LayoutStore] Invalid layout structure in localStorage. Falling back to default.");
                }
            }
        } catch (error) {
            console.error("[LayoutStore] Error loading or parsing layout from localStorage:", error);
            // Clear potentially corrupted data
            try {
                localStorage.removeItem(LAYOUT_STORAGE_KEY);
            } catch (removeError) {
                console.error("[LayoutStore] Error removing corrupted layout data:", removeError);
            }
            loadedModel = null; // Ensure fallback
            initialTabs.clear(); // Clear tabs if loading failed
        }
    }

    // Fallback to initial layout if loading failed
    if (!loadedModel) {
        console.log("[LayoutStore] Using initial default layout.");
        loadedModel = Model.fromJson(initialLayoutJson);
        // No tabs in the default layout initially
    }

    return { model: loadedModel, initialTabs };
};


export const useLayoutStore = create<LayoutState>((set, get) => {
    // --- Load model and initial tabs ONCE during store creation ---
    const { model: initialModel, initialTabs } = loadModelFromStorage();

    return {
        layoutRef: null,
        model: initialModel, // Use the loaded or default model
        tabs: initialTabs, // Use the tabs derived from the loaded model or empty map
        activeTabId: initialModel.getActiveTabset()?.getSelectedNode()?.getId(), // Initialize activeTabId from loaded model

        setLayoutRef: (layout) => set({ layoutRef: layout }),

        setModel: (model) => { // Allow setting model, but re-sync tabs map
            const newTabs = new Map<string, TabData>();
            model.visitNodes((node) => {
                if (node instanceof TabNode) {
                    const tabData: TabData = {
                        id: node.getId(),
                        name: node.getName(),
                        component: node.getComponent() || 'unknown',
                        icon: node.getIcon(),
                    };
                    newTabs.set(node.getId(), tabData);
                }
            });
            set({
                model,
                tabs: newTabs,
                activeTabId: model.getActiveTabset()?.getSelectedNode()?.getId()
            });
            // Trigger persistence after direct model set
            get().persistLayout();
        },

        setActiveTabId: (tabId) => {
            if (get().activeTabId !== tabId) {
                console.log("Setting active tab:", tabId);
                set({ activeTabId: tabId });
            }
        },

        addTab: (tabData, location = DockLocation.CENTER, select = true) => {
            const { model } = get(); // Don't get tabs here, rely on model actions
            const nodeId = tabData.id;
            let addedNode: Node | undefined;

            if (model.getNodeById(nodeId)) {
                // Tab already exists, just select it
                const existingNode = model.getNodeById(nodeId);
                if (existingNode instanceof TabNode) {
                    addedNode = existingNode; // Return the existing node
                    if (select) {
                        get().selectTab(nodeId); // Use the selectTab action
                    }
                    // Update tab data in the store if needed (e.g., icon changed via props)
                    const currentTabs = get().tabs;
                    if (currentTabs.get(nodeId)?.name !== tabData.name || currentTabs.get(nodeId)?.icon !== tabData.icon) {
                        const newTabs = new Map(currentTabs);
                        newTabs.set(nodeId, tabData);
                        set({ tabs: newTabs });
                    }
                }
                return addedNode as TabNode | undefined;
            }

            // If tab doesn't exist, proceed to add
            let targetNodeId = model.getActiveTabset()?.getId() ?? '#main-tabset';
            const activeTabset = model.getActiveTabset(); // Get active tabset *before* potentially changing it

            // Adjust target for side docking
            if (location !== DockLocation.CENTER && activeTabset) {
                const parentRow = activeTabset.getParent() as Node | undefined;
                // Target the row containing the active tabset for side docking
                if (parentRow && parentRow.getType() === 'row') {
                    targetNodeId = parentRow.getId();
                } else {
                    // Fallback if parent isn't a row (shouldn't usually happen in standard layouts)
                    targetNodeId = model.getRoot().getId();
                }
            } else if (!activeTabset) {
                // No active tabset, target the root row's first child (usually main tabset) or root itself
                const root = model.getRoot();
                targetNodeId = root?.getChildren()[0]?.getId() ?? root.getId();
            }


            const tabJson: IJsonTabNode = {
                type: 'tab',
                id: nodeId,
                name: tabData.name,
                component: tabData.component,
                icon: tabData.icon,
                config: { itemId: tabData.id },
            };

            // Perform the action - this will trigger onModelChange later
            addedNode = model.doAction(Actions.addNode(
                tabJson,
                targetNodeId,
                location,
                -1, // FlexLayout handles index correctly for side docks
                select
            ));

            // Update internal tabs map *after* action successfully adds node
            if (addedNode instanceof TabNode) {
                const newTabs = new Map(get().tabs);
                newTabs.set(nodeId, tabData);
                set({
                    tabs: newTabs,
                    // Active tab ID will be updated by onModelChange handler via SELECT_TAB action
                });
            } else {
                console.error("Failed to add node to layout model:", tabData.id);
            }


            return addedNode as TabNode | undefined;
        },

        selectTab: (tabId) => {
            const { model } = get();
            const node = model.getNodeById(tabId);

            if (node instanceof TabNode) {
                const parent = node.getParent();
                let currentSelectedInParent = -1;
                if (parent instanceof TabSetNode || parent instanceof BorderNode) {
                    currentSelectedInParent = parent.getSelected();
                }
                const nodeIndexInParent = parent?.getChildren().indexOf(node);

                // Only dispatch action if the tab is not already selected in its parent
                if (nodeIndexInParent !== undefined && currentSelectedInParent !== nodeIndexInParent) {
                    model.doAction(Actions.selectTab(tabId));
                } else if (get().activeTabId !== tabId) {
                    // If already visually selected but not active in store, update store
                    set({ activeTabId: tabId });
                }
            } else {
                console.warn(`Attempted to select non-existent or non-tab node: ${tabId}`);
                if (get().activeTabId === tabId) {
                    set({ activeTabId: undefined }); // Clear active ID if it points to a removed node
                }
            }
        },

        // src/lib/store/useLayoutStore.ts
        removeTab: (tabId) => {
            const { model, tabs, activeTabId } = get();
            const nodeToDelete = model.getNodeById(tabId);
            let nextActiveTabId = activeTabId; // Assume current active might remain

            if (nodeToDelete instanceof TabNode) {
                const parent = nodeToDelete.getParent(); // Get parent before deleting

                // Perform the deletion action
                model.doAction(Actions.deleteTab(tabId)); // This mutates the model and triggers internal selection changes

                const newTabs = new Map(tabs);
                newTabs.delete(tabId);
                set({ tabs: newTabs }); // Update our tab map

                // Now, determine the next active tab based on the *updated* model state
                if (activeTabId === tabId) { // Only need to find a *new* active tab if the deleted one *was* active
                    let newlySelectedNode: Node | undefined = undefined;

                    // Check if the *original* parent still exists and has a selected node
                    if (parent && model.getNodeById(parent.getId())) {
                        if (parent instanceof TabSetNode || parent instanceof BorderNode) {
                            newlySelectedNode = parent.getSelectedNode();
                        }
                    }

                    // If the original parent didn't yield a selection, check the model's current active tabset
                    if (!newlySelectedNode) {
                        const currentActiveTabset = model.getActiveTabset();
                        newlySelectedNode = currentActiveTabset?.getSelectedNode();
                    }

                    // If still no selection, iterate globally to find the first available tab
                    if (!newlySelectedNode) {
                        model.visitNodes((node) => {
                            if (!newlySelectedNode && node instanceof TabNode) { // Find the *first* remaining TabNode
                                newlySelectedNode = node;
                            }
                        });
                    }

                    nextActiveTabId = newlySelectedNode?.getId(); // Can be undefined if no tabs left
                    console.log("Setting next active tab after remove:", nextActiveTabId);
                    set({ activeTabId: nextActiveTabId }); // Update store state
                }
                // If the deleted tab wasn't active, nextActiveTabId remains unchanged unless FlexLayout itself changed it,
                // which would trigger a SELECT_TAB action handled by onModelChange later.

                return nextActiveTabId; // Return the ID for navigation
            }
            return undefined; // Node not found or not a TabNode
        },

        renameTab: (tabId, newName) => {
            const { model, tabs } = get();
            const node = model.getNodeById(tabId);
            const currentTabData = tabs.get(tabId);

            if (node instanceof TabNode && currentTabData && currentTabData.name !== newName) {
                model.doAction(Actions.renameTab(tabId, newName)); // Triggers model change
                const newTabs = new Map(tabs);
                newTabs.set(tabId, { ...currentTabData, name: newName });
                set({ tabs: newTabs });
            }
        },

        // --- NEW: Action to persist layout ---
        persistLayout: () => {
            const { model } = get();
            if (typeof window !== 'undefined' && window.localStorage) {
                try {
                    const layoutJson = model.toJson();
                    const layoutJsonString = JSON.stringify(layoutJson);
                    localStorage.setItem(LAYOUT_STORAGE_KEY, layoutJsonString);
                    console.log("[LayoutStore] Layout persisted to localStorage.");
                } catch (error) {
                    console.error("[LayoutStore] Error persisting layout to localStorage:", error);
                }
            }
        },
    }
});

// Function to get the active tab ID outside components if needed
export const getActiveTabId = () => useLayoutStore.getState().activeTabId;

// Function to get tab data outside components
export const getTabData = (tabId: string) => useLayoutStore.getState().tabs.get(tabId);