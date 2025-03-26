// src/lib/sidebar-data.ts
import {
    type TreeItem,
    type TreeItemIndex
} from "react-complex-tree";
import {
    FileText,
    Folder,
    BookOpen,
    Briefcase,
    Users,
    FilePieChart,
    ClipboardList,
    Goal,
    CalendarDays,
    Paintbrush,
    Code2,
    Wrench,
    Palette,
    FunctionSquare,
    Database, Lightbulb,
    ShieldCheck, // Example, might not be used below
    Scale
} from "lucide-react";

export interface ItemData {
    name: string;
    type: 'folder' | 'document' | 'library-item';
    icon?: React.ElementType;
    emoji?: string;
    url?: string;
}

export type ExtendedTreeItem = TreeItem<ItemData>;
export type TreeItems = Record<TreeItemIndex, ExtendedTreeItem>;

let idCounter = 0;
const createItem = (
    name: string,
    type: ItemData['type'],
    childrenIds: TreeItemIndex[] = [],
    emoji?: string,
    url?: string,
    icon?: React.ElementType,
): Record<TreeItemIndex, ExtendedTreeItem> => {
    const id: TreeItemIndex = `${type}-${idCounter++}`;
    const isFolder = type === 'folder' || childrenIds.length > 0;
    const item: ExtendedTreeItem = {
        index: id,
        data: { name, type, emoji, url, icon: icon },
        isFolder: isFolder,
        children: childrenIds,
        canMove: true,
        canRename: true,
    };
    return { [id]: item };
};

// --- Default Icons ---
export const defaultIcons: { [key in ItemData['type']]: React.ElementType } = {
    folder: Folder,
    document: FileText,
    'library-item': BookOpen,
};

// --- MOCK DOCUMENTS DATA ---

// Level 3/4 Items (Deepest) - No change needed here
const doc_phoenix_proto_v1 = createItem("Mobile Prototype", "document", [], "📱", "/docs/projects/phoenix/design/proto-v1");
const doc_phoenix_proto_v2 = createItem("Desktop Prototype", "document", [], "💻", "/docs/projects/phoenix/design/proto-v2");
const doc_phoenix_interviews_raw = createItem("Raw Interview Notes", "document", [], "🗒️", "/docs/projects/phoenix/research/interviews-raw");
const doc_chimera_api_auth = createItem("Auth Endpoints", "document", [], "🔑", "/docs/projects/chimera/api/auth");
const doc_chimera_api_users = createItem("User Endpoints", "document", [], "👤", "/docs/projects/chimera/api/users");
const doc_hr_policy_pto = createItem("PTO Policy", "document", [], "🌴", "/docs/company/hr/pto");
const doc_legal_nda_vendor = createItem("Vendor NDA", "document", [], "✍️", "/docs/company/legal/nda-vendor");
const doc_finance_expense_guide = createItem("Expense Reporting Guide", "document", [], "🧾", "/docs/company/finance/expense-guide");
const doc_meetings_q3_kickoff_slides = createItem("Q3 Kickoff Slides", "document", [], "📊", "/docs/meetings/q3-2024/kickoff-slides");

// Level 2 Items - No change needed here
const doc_folder_phoenix_proto = createItem("Prototypes", "folder", [Object.keys(doc_phoenix_proto_v1)[0], Object.keys(doc_phoenix_proto_v2)[0]], "🖼️", undefined, Paintbrush);
const doc_phoenix_design_system = createItem("Design System Specs", "document", [], "🎨", "/docs/projects/phoenix/design/system");
const doc_phoenix_spec_core = createItem("Core Feature Spec", "document", [], "💡", "/docs/projects/phoenix/specs/core");
const doc_phoenix_spec_arch = createItem("Architecture Overview", "document", [], "🏗️", "/docs/projects/phoenix/specs/arch");
const doc_folder_phoenix_research_sum = createItem("Research Summaries", "folder", [], "📊");
const doc_folder_phoenix_interviews = createItem("User Interviews", "folder", [Object.keys(doc_phoenix_interviews_raw)[0]], "🗣️");
const doc_folder_chimera_api = createItem("API Docs", "folder", [Object.keys(doc_chimera_api_auth)[0], Object.keys(doc_chimera_api_users)[0]], "☁️");
const doc_chimera_backend_schema = createItem("DB Schema", "document", [], "💾", "/docs/projects/chimera/backend/schema", Database);
const doc_chimera_frontend_setup = createItem("Setup Guide", "document", [], "🛠️", "/docs/projects/chimera/frontend/setup");
const doc_hr_onboarding = createItem("Onboarding Checklist", "document", [], "✅", "/docs/company/hr/onboarding", ClipboardList);
const doc_folder_hr_policies = createItem("Policies", "folder", [Object.keys(doc_hr_policy_pto)[0]], "📜");
const doc_legal_tos = createItem("Terms of Service", "document", [], "📄", "/docs/company/legal/tos", Scale);
const doc_folder_legal_nda = createItem("NDAs", "folder", [Object.keys(doc_legal_nda_vendor)[0]], "🤫");
const doc_finance_report_q1 = createItem("Q1 Financial Report", "document", [], "📈", "/docs/company/finance/q1-report", FilePieChart);
const doc_finance_report_q2 = createItem("Q2 Financial Report", "document", [], "📉", "/docs/company/finance/q2-report", FilePieChart);
const doc_folder_finance_guides = createItem("Guides", "folder", [Object.keys(doc_finance_expense_guide)[0]], "📖");
const doc_meetings_q3_kickoff = createItem("Q3 Kickoff Meeting", "document", [Object.keys(doc_meetings_q3_kickoff_slides)[0]], "🚀", "/docs/meetings/q3-2024/kickoff");
const doc_meetings_product_sync_notes = createItem("Product Sync Notes", "document", [], "🗣️", "/docs/meetings/product-syncs/notes");
const doc_meetings_eng_sync_notes = createItem("Engineering Sync Notes", "document", [], "⚙️", "/docs/meetings/eng-syncs/notes");

// Level 1 Items - No change needed here
const doc_folder_phoenix_design = createItem("Design", "folder", [Object.keys(doc_folder_phoenix_proto)[0], Object.keys(doc_phoenix_design_system)[0]], "🎨", undefined, Paintbrush);
const doc_folder_phoenix_specs = createItem("Specifications", "folder", [Object.keys(doc_phoenix_spec_core)[0], Object.keys(doc_phoenix_spec_arch)[0]], "📝");
const doc_folder_phoenix_research = createItem("User Research", "folder", [Object.keys(doc_folder_phoenix_interviews)[0], Object.keys(doc_folder_phoenix_research_sum)[0]], "🧑‍🔬", undefined, Users);
const doc_folder_chimera_backend = createItem("Backend", "folder", [Object.keys(doc_chimera_backend_schema)[0]], "⚙️");
const doc_folder_chimera_frontend = createItem("Frontend", "folder", [Object.keys(doc_chimera_frontend_setup)[0]], "💻");
const doc_folder_hr = createItem("Human Resources", "folder", [Object.keys(doc_hr_onboarding)[0], Object.keys(doc_folder_hr_policies)[0]], "👥", undefined, Users);
const doc_folder_legal = createItem("Legal", "folder", [Object.keys(doc_legal_tos)[0], Object.keys(doc_folder_legal_nda)[0]], "⚖️", undefined, Scale);
const doc_folder_finance = createItem("Finance", "folder", [Object.keys(doc_finance_report_q1)[0], Object.keys(doc_finance_report_q2)[0], Object.keys(doc_folder_finance_guides)[0]], "💰", undefined, FilePieChart);
const doc_folder_meetings_q3 = createItem("Q3 2024", "folder", [Object.keys(doc_meetings_q3_kickoff)[0]], "📅");
const doc_folder_meetings_product = createItem("Product Syncs", "folder", [Object.keys(doc_meetings_product_sync_notes)[0]], "🎯");
const doc_folder_meetings_eng = createItem("Eng Syncs", "folder", [Object.keys(doc_meetings_eng_sync_notes)[0]], "🛠️");

// *** FIX STARTS HERE ***

// Create Level 1 Project Folders first
const doc_subfolder_phoenix = createItem("Project Phoenix", "folder", [Object.keys(doc_folder_phoenix_specs)[0], Object.keys(doc_folder_phoenix_design)[0], Object.keys(doc_folder_phoenix_research)[0]], "🔥", undefined, Briefcase);
const doc_subfolder_phoenix_id = Object.keys(doc_subfolder_phoenix)[0];

const doc_subfolder_chimera = createItem("Project Chimera", "folder", [Object.keys(doc_folder_chimera_api)[0], Object.keys(doc_folder_chimera_backend)[0], Object.keys(doc_folder_chimera_frontend)[0]], "🐉", undefined, Briefcase);
const doc_subfolder_chimera_id = Object.keys(doc_subfolder_chimera)[0];

// Level 0 Items (Under Root) - Now use the IDs from above
const doc_folder_projects = createItem("Projects", "folder", [
    doc_subfolder_phoenix_id, // Use the ID
    doc_subfolder_chimera_id, // Use the ID
], "🚀", undefined, Briefcase);

const doc_folder_company = createItem("Company Docs", "folder", [Object.keys(doc_folder_hr)[0], Object.keys(doc_folder_legal)[0], Object.keys(doc_folder_finance)[0]], "🏢");
const doc_folder_meetings = createItem("Meetings", "folder", [Object.keys(doc_folder_meetings_q3)[0], Object.keys(doc_folder_meetings_product)[0], Object.keys(doc_folder_meetings_eng)[0]], "🗓️", undefined, CalendarDays);
const doc_roadmap = createItem("Roadmap Q4 2024", "document", [], "🗺️", "/docs/roadmap-q4", Goal);
const doc_quick_notes = createItem("Quick Notes", "document", [], "✏️", "/docs/quick-notes");

export const initialDocumentItems: TreeItems = {
    root: {
        index: "root",
        data: { name: "Documents Root", type: "folder" },
        isFolder: true,
        children: [
            Object.keys(doc_folder_projects)[0], // Use the ID
            Object.keys(doc_folder_company)[0],
            Object.keys(doc_folder_meetings)[0],
            Object.keys(doc_roadmap)[0],
            Object.keys(doc_quick_notes)[0],
        ]
    },
    // Spread all created items - including the subfolders created above
    ...doc_folder_projects,
    ...doc_subfolder_phoenix, // Spread the intermediate folder
    ...doc_subfolder_chimera, // Spread the intermediate folder
    ...doc_folder_phoenix_specs, ...doc_folder_phoenix_design, ...doc_folder_phoenix_research,
    ...doc_folder_phoenix_proto, ...doc_phoenix_design_system, ...doc_phoenix_spec_core, ...doc_phoenix_spec_arch,
    ...doc_folder_phoenix_interviews, ...doc_folder_phoenix_research_sum, ...doc_phoenix_proto_v1, ...doc_phoenix_proto_v2, ...doc_phoenix_interviews_raw,
    ...doc_folder_chimera_api, ...doc_folder_chimera_backend, ...doc_folder_chimera_frontend,
    ...doc_chimera_api_auth, ...doc_chimera_api_users, ...doc_chimera_backend_schema, ...doc_chimera_frontend_setup,
    ...doc_folder_company, ...doc_folder_hr, ...doc_folder_legal, ...doc_folder_finance,
    ...doc_hr_onboarding, ...doc_folder_hr_policies, ...doc_hr_policy_pto,
    ...doc_legal_tos, ...doc_folder_legal_nda, ...doc_legal_nda_vendor,
    ...doc_finance_report_q1, ...doc_finance_report_q2, ...doc_folder_finance_guides, ...doc_finance_expense_guide,
    ...doc_folder_meetings, ...doc_folder_meetings_q3, ...doc_folder_meetings_product, ...doc_folder_meetings_eng,
    ...doc_meetings_q3_kickoff, ...doc_meetings_q3_kickoff_slides, ...doc_meetings_product_sync_notes, ...doc_meetings_eng_sync_notes,
    ...doc_roadmap, ...doc_quick_notes,
};


// --- MOCK LIBRARY DATA ---

// Level 3 Items - No change needed
const lib_comp_select_option = createItem("Select Option", "library-item", [], "", "/library/components/select-option", undefined);
const lib_hook_fetch_instance = createItem("useFetchInstance (Internal)", "library-item", [], "", "/library/hooks/fetch-instance", undefined);
const lib_token_color_primary_shades = createItem("Primary Shades", "library-item", [], "", "/library/tokens/colors/primary-shades", undefined);

// Level 2 Items - No change needed
const lib_comp_button_variants = createItem("Button Variants", "library-item", [], "✨", "/library/components/button-variants");
const lib_comp_input_types = createItem("Input Types", "library-item", [], "⌨️", "/library/components/input-types");
const lib_folder_comp_select = createItem("Select Components", "folder", [Object.keys(lib_comp_select_option)[0]], "🔽");
const lib_comp_card_example = createItem("Card Example", "library-item", [], "🖼️", "/library/components/card-example");
const lib_comp_alert_styles = createItem("Alert Styles", "library-item", [], "🎨", "/library/components/alert-styles");
const lib_comp_spinner_sizes = createItem("Spinner Sizes", "library-item", [], "⚙️", "/library/components/spinner-sizes");
const lib_hook_storage_local = createItem("useLocalStorage", "library-item", [], "💾", "/library/hooks/storage/local");
const lib_hook_storage_session = createItem("useSessionStorage", "library-item", [], "⏳", "/library/hooks/storage/session");
const lib_folder_hook_fetch = createItem("Data Fetching", "folder", [Object.keys(lib_hook_fetch_instance)[0]], "☁️");
const lib_hook_ui_debounce = createItem("useDebounce", "library-item", [], "⏳", "/library/hooks/ui/debounce");
const lib_hook_ui_throttle = createItem("useThrottle", "library-item", [], "⏱️", "/library/hooks/ui/throttle");
const lib_hook_auth_context = createItem("useAuthContext", "library-item", [], "🔒", "/library/hooks/auth/context", ShieldCheck);
const lib_util_date_format = createItem("formatDate", "library-item", [], "📅", "/library/utils/date/format");
const lib_util_string_slugify = createItem("slugify", "library-item", [], "🔗", "/library/utils/string/slugify");
const lib_util_validation_email = createItem("validateEmail", "library-item", [], "📧", "/library/utils/validation/email");
const lib_folder_token_colors = createItem("Colors", "folder", [Object.keys(lib_token_color_primary_shades)[0]], " C", undefined, Palette);
const lib_token_typography_scale = createItem("Typographic Scale", "library-item", [], " Aa", "/library/tokens/typography/scale");
const lib_token_spacing_units = createItem("Spacing Units", "library-item", [], "📏", "/library/tokens/spacing/units");


// *** FIX STARTS HERE ***

// Create Level 2 Form items first
const lib_item_button = createItem("Button", "library-item", [Object.keys(lib_comp_button_variants)[0]], "🔘", "/library/components/button", Code2);
const lib_item_button_id = Object.keys(lib_item_button)[0];
const lib_item_input = createItem("Input", "library-item", [Object.keys(lib_comp_input_types)[0]], "⌨️", "/library/components/input", Code2);
const lib_item_input_id = Object.keys(lib_item_input)[0];
const lib_item_checkbox = createItem("Checkbox", "library-item", [], "☑️", "/library/components/checkbox", Code2);
const lib_item_checkbox_id = Object.keys(lib_item_checkbox)[0];

// Create Level 2 Layout items first
const lib_item_card = createItem("Card", "library-item", [Object.keys(lib_comp_card_example)[0]], "🃏", "/library/components/card", Code2);
const lib_item_card_id = Object.keys(lib_item_card)[0];
const lib_item_grid = createItem("Grid", "library-item", [], "▦", "/library/components/grid", Code2);
const lib_item_grid_id = Object.keys(lib_item_grid)[0];

// Create Level 2 Feedback items first
const lib_item_alert = createItem("Alert", "library-item", [Object.keys(lib_comp_alert_styles)[0]], "⚠️", "/library/components/alert", Code2);
const lib_item_alert_id = Object.keys(lib_item_alert)[0];
const lib_item_spinner = createItem("Spinner", "library-item", [Object.keys(lib_comp_spinner_sizes)[0]], "⏳", "/library/components/spinner", Code2);
const lib_item_spinner_id = Object.keys(lib_item_spinner)[0];

// Level 1 Items - Use IDs from above
const lib_folder_comp_forms = createItem("Forms", "folder", [
    lib_item_button_id,
    lib_item_input_id,
    Object.keys(lib_folder_comp_select)[0],
    lib_item_checkbox_id,
], "📝");
const lib_folder_comp_layout = createItem("Layout", "folder", [
    lib_item_card_id,
    lib_item_grid_id,
], "📐");
const lib_folder_comp_feedback = createItem("Feedback", "folder", [
    lib_item_alert_id,
    lib_item_spinner_id,
], "📢");
const lib_folder_hook_storage = createItem("Storage", "folder", [Object.keys(lib_hook_storage_local)[0], Object.keys(lib_hook_storage_session)[0]], "💾", undefined, Database);
const lib_folder_hook_ui = createItem("UI Helpers", "folder", [Object.keys(lib_hook_ui_debounce)[0], Object.keys(lib_hook_ui_throttle)[0]], "✨");
const lib_folder_hook_auth = createItem("Authentication", "folder", [Object.keys(lib_hook_auth_context)[0]], "🔐", undefined, ShieldCheck);
const lib_folder_util_date = createItem("Date Utils", "folder", [Object.keys(lib_util_date_format)[0]], "📅");
const lib_folder_util_string = createItem("String Utils", "folder", [Object.keys(lib_util_string_slugify)[0]], "✂️");
const lib_folder_util_validation = createItem("Validation", "folder", [Object.keys(lib_util_validation_email)[0]], "✔️");
const lib_folder_token_typography = createItem("Typography", "folder", [Object.keys(lib_token_typography_scale)[0]], " T", undefined, Palette);
const lib_folder_token_spacing = createItem("Spacing", "folder", [Object.keys(lib_token_spacing_units)[0]], " S", undefined, Palette);

// Level 0 Items (Under Root) - Use IDs from above
const lib_folder_components = createItem("Components", "folder", [Object.keys(lib_folder_comp_forms)[0], Object.keys(lib_folder_comp_layout)[0], Object.keys(lib_folder_comp_feedback)[0]], "🧩", undefined, Code2);
const lib_folder_hooks = createItem("Hooks", "folder", [Object.keys(lib_folder_hook_storage)[0], Object.keys(lib_folder_hook_fetch)[0], Object.keys(lib_folder_hook_ui)[0], Object.keys(lib_folder_hook_auth)[0]], "⚓", undefined, FunctionSquare);
const lib_folder_utils = createItem("Utilities", "folder", [Object.keys(lib_folder_util_date)[0], Object.keys(lib_folder_util_string)[0], Object.keys(lib_folder_util_validation)[0]], "🔧", undefined, Wrench);
const lib_folder_tokens = createItem("Design Tokens", "folder", [Object.keys(lib_folder_token_colors)[0], Object.keys(lib_folder_token_typography)[0], Object.keys(lib_folder_token_spacing)[0]], "🎨", undefined, Palette);
const lib_contributing_guide = createItem("Contributing Guide", "library-item", [], "🤝", "/library/contributing", Lightbulb);

export const initialLibraryItems: TreeItems = {
    root: {
        index: "root",
        data: { name: "Library Root", type: "folder" },
        isFolder: true,
        children: [
            Object.keys(lib_folder_components)[0],
            Object.keys(lib_folder_hooks)[0],
            Object.keys(lib_folder_utils)[0],
            Object.keys(lib_folder_tokens)[0],
            Object.keys(lib_contributing_guide)[0],
        ]
    },
    // Spread all created items - including the intermediate items/folders
    ...lib_folder_components, ...lib_folder_hooks, ...lib_folder_utils, ...lib_folder_tokens, ...lib_contributing_guide,
    ...lib_folder_comp_forms, ...lib_folder_comp_layout, ...lib_folder_comp_feedback,
    ...lib_item_button, ...lib_comp_button_variants, // Spread item and its child
    ...lib_item_input, ...lib_comp_input_types, // Spread item and its child
    ...lib_folder_comp_select, ...lib_comp_select_option, // Spread folder and its child
    ...lib_item_checkbox,
    ...lib_item_card, ...lib_comp_card_example, // Spread item and its child
    ...lib_item_grid,
    ...lib_item_alert, ...lib_comp_alert_styles, // Spread item and its child
    ...lib_item_spinner, ...lib_comp_spinner_sizes, // Spread item and its child
    ...lib_folder_hook_storage, ...lib_folder_hook_fetch, ...lib_folder_hook_ui, ...lib_folder_hook_auth,
    ...lib_hook_storage_local, ...lib_hook_storage_session, ...lib_hook_fetch_instance, ...lib_hook_ui_debounce, ...lib_hook_ui_throttle, ...lib_hook_auth_context,
    ...lib_folder_util_date, ...lib_folder_util_string, ...lib_folder_util_validation,
    ...lib_util_date_format, ...lib_util_string_slugify, ...lib_util_validation_email,
    ...lib_folder_token_colors, ...lib_folder_token_typography, ...lib_folder_token_spacing,
    ...lib_token_color_primary_shades, ...lib_token_typography_scale, ...lib_token_spacing_units,
};

// *** FIX ENDS HERE ***