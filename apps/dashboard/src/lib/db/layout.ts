import Dexie, { type Table } from 'dexie';
import type { IJsonModel } from '@app/layout';

// Use constants directly or import them if needed elsewhere
export const SIDEBAR_WIDTH_SETTING_KEY = "sidebarWidth";
export const SIDEBAR_OPEN_SETTING_KEY = "sidebarOpen";
export const MAIN_LAYOUT_KEY = 'mainLayoutState';
export const DEFAULT_SIDEBAR_WIDTH_DB = 256; // Define default here

export interface Setting {
    key: string; // Primary key
    value: any;
}

export interface LayoutDbState {
    id: string; // Primary key
    state: IJsonModel;
    timestamp: Date;
}

export class AppDatabase extends Dexie {
    settings!: Table<Setting, string>;
    layoutState!: Table<LayoutDbState, string>;

    constructor() {
        super('AppDatabase');
        this.version(1).stores({
            settings: 'key',
            layoutState: 'id',
        });
    }
}

export const db = new AppDatabase();

// --- Persistence Helpers (Keep these in the main app) ---
export async function saveSidebarWidth(width: number): Promise<void> {
    try {
        await db.settings.put({ key: SIDEBAR_WIDTH_SETTING_KEY, value: width });
    } catch (error) {
        console.error("Dexie: Failed to save sidebar width", error);
    }
}

export async function saveSidebarOpen(isOpen: boolean): Promise<void> {
    try {
        await db.settings.put({ key: SIDEBAR_OPEN_SETTING_KEY, value: isOpen });
    } catch (error) {
        console.error("Dexie: Failed to save sidebar open state", error);
    }
}

export async function saveLayoutState(layoutModel: IJsonModel): Promise<void> {
    // ... (implementation from previous step)
    try {
        const stateToSave: LayoutDbState = { id: MAIN_LAYOUT_KEY, state: layoutModel, timestamp: new Date() };
        await db.layoutState.put(stateToSave);
    } catch (error) { console.error("Dexie: Failed to save layout state", error); }
}

export async function loadLayoutState(): Promise<IJsonModel | null> {
    // ... (implementation from previous step)
    try {
        const savedState = await db.layoutState.get(MAIN_LAYOUT_KEY);
        return savedState?.state ?? null;
    } catch (error) { console.error("Dexie: Failed to load layout state", error); return null; }
}