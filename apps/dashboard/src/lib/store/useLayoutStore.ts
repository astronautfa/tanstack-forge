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
    // Add more actions later (openToSide, closeOtherTabs etc.)
}

// Define the initial layout structure
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


export const useLayoutStore = create<LayoutState>((set, get) => ({
    layoutRef: null,
    model: Model.fromJson(initialLayoutJson),
    tabs: new Map<string, TabData>(),
    activeTabId: undefined,

    setLayoutRef: (layout) => set({ layoutRef: layout }),

    setModel: (model) => set({ model }), // Direct model setting, use with care

    setActiveTabId: (tabId) => {
        if (get().activeTabId !== tabId) {
            console.log("Setting active tab:", tabId);
            set({ activeTabId: tabId });
        }
    },

    addTab: (tabData, location = DockLocation.CENTER, select = true) => {
        const { model, tabs } = get();
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
            }
            return addedNode as TabNode | undefined;
        }

        // Add new tab data to our store map
        const newTabs = new Map(tabs);
        newTabs.set(nodeId, tabData);

        // Add node to the flexlayout model
        let targetNodeId = model.getActiveTabset()?.getId() ?? '#main-tabset';

        // Adjust target for side docking
        if (location !== DockLocation.CENTER) {
            const activeTabset = model.getActiveTabset();
            if (activeTabset) {
                targetNodeId = activeTabset.getParent()?.getId() ?? targetNodeId;
            }
            // If still main-tabset and trying to dock sideways, target the root row
            if (targetNodeId === '#main-tabset' && activeTabset?.getParent()?.getId() === '#root-row') {
                targetNodeId = '#root-row';
            }
        }

        const tabJson: IJsonTabNode = { // Use IJsonTabNode type
            type: 'tab', // Explicitly set type
            id: nodeId,
            name: tabData.name,
            component: tabData.component,
            icon: tabData.icon,
            config: { itemId: tabData.id },
        };

        // Perform the action and get the added node
        addedNode = model.doAction(Actions.addNode(
            tabJson,
            targetNodeId,
            location,
            -1, // Add to the end when location is CENTER, flexlayout handles index for side docks
            select
        ));

        set({
            tabs: newTabs,
            activeTabId: select && addedNode ? nodeId : get().activeTabId,
        });

        return addedNode as TabNode | undefined;
    },

    selectTab: (tabId) => {
        const { model, activeTabId } = get();
        const node = model.getNodeById(tabId);

        if (node && node.getType() === 'tab') {
            // Only perform action if not already active visually (model state might differ)
            const parentTabset = node.getParent() as TabSetNode;
            const currentSelected = parentTabset?.getSelected();
            const currentIndex = parentTabset?.getChildren().indexOf(node);

            if (parentTabset && currentIndex !== undefined && currentSelected !== currentIndex) {
                model.doAction(Actions.selectTab(tabId));
            }
            // Always update Zustand state
            get().setActiveTabId(tabId); // Use internal setter

        } else {
            console.warn(`Attempted to select non-existent or non-tab node: ${tabId}`);
            // If the node doesn't exist, clear activeTabId if it matches
            if (!node && activeTabId === tabId) {
                get().setActiveTabId(undefined);
            }
        }
    },

    removeTab: (tabId) => {
        const { model, tabs, activeTabId } = get();
        const node = model.getNodeById(tabId);
        let nextActiveTabId = activeTabId;

        if (node) {
            const parentTabset = node.getParent() as TabSetNode | BorderNode | undefined;
            model.doAction(Actions.deleteTab(tabId)); // This mutates the model
            const newTabs = new Map(tabs);
            newTabs.delete(tabId);

            // Determine the next active tab ONLY if the removed tab was active
            if (activeTabId === tabId) {
                // Try selecting the new selected tab in the *same* tabset (if it still exists)
                nextActiveTabId = parentTabset?.getSelectedNode()?.getId();

                // If the tabset is now empty or gone, find *any* other available tab
                if (!nextActiveTabId) {
                    // Check main tabset first
                    const mainTabset = model.getNodeById('#main-tabset') as TabSetNode | undefined;
                    nextActiveTabId = mainTabset?.getSelectedNode()?.getId();

                    // If still no active tab, try finding any tabset and its selected tab
                    if (!nextActiveTabId) {
                        model.visitNodes((node) => {
                            if (!nextActiveTabId && node instanceof TabSetNode && node.getChildren().length > 0) {
                                nextActiveTabId = node.getSelectedNode()?.getId();
                            }
                        });
                    }
                }
                console.log("Setting next active tab after remove:", nextActiveTabId);
                get().setActiveTabId(nextActiveTabId); // Update state immediately
            }

            set({
                tabs: newTabs,
                activeTabId: nextActiveTabId, // Update state with potentially new active tab
            });
            return nextActiveTabId; // Return the ID for potential navigation
        }
        return undefined;
    },

    renameTab: (tabId, newName) => {
        const { model, tabs } = get();
        const node = model.getNodeById(tabId);
        const currentTabData = tabs.get(tabId);

        if (node && currentTabData && currentTabData.name !== newName) {
            model.doAction(Actions.renameTab(tabId, newName));
            const newTabs = new Map(tabs);
            newTabs.set(tabId, { ...currentTabData, name: newName });
            set({ tabs: newTabs });
        }
    },
}));

// Function to get the active tab ID outside components if needed
export const getActiveTabId = () => useLayoutStore.getState().activeTabId;

// Function to get tab data outside components
export const getTabData = (tabId: string) => useLayoutStore.getState().tabs.get(tabId);