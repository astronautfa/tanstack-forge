import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@app/ui/components/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@app/ui/components/alert-dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@app/ui/components/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@app/ui/components/card";
import { Button } from "@app/ui/components/button";
import { Badge } from "@app/ui/components/badge";
import { Slider } from "@app/ui/components/slider";
import { Switch } from "@app/ui/components/switch";
import { Input } from "@app/ui/components/input";
import { Textarea } from "@app/ui/components/textarea";
import { ScrollArea } from "@app/ui/components/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@app/ui/components/tooltip";
import { cn } from "@app/ui/lib/utils";
import {
    Settings2,
    BrainCircuit,
    PanelLeft,
    Sparkles,
    MessageSquare,
    SlidersHorizontal,
    Info,
    RefreshCw,
    Download,
    Trash2,
    Undo2,
    Save,
    AlertTriangle,
} from 'lucide-react';

// --- Interface Definitions ---
export interface ModelSettings {
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    modelId?: string;
}

export interface ChatUISettings {
    showTimestamps: boolean;
    compactMode: boolean;
    autoScroll: boolean;
    darkMode?: boolean;
    enableKeyboardShortcuts?: boolean;
    messageSounds?: boolean;
    enableMarkdown?: boolean;
}

export interface ModelOption {
    id: string;
    name: string;
    description?: string;
    capabilities?: string[];
    isDefault?: boolean;
}

export interface ChatSettingsDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    modelSettings: ModelSettings;
    setModelSettings: (settings: ModelSettings) => void;
    uiSettings: ChatUISettings;
    setUISettings: (settings: ChatUISettings) => void;
    availableModels?: ModelOption[];
    onClearHistory?: () => void;
    onExportChat?: () => void;
    defaultModelSettings: ModelSettings;
    defaultUISettings: ChatUISettings;
}

const ChatSettingsDialog: React.FC<ChatSettingsDialogProps> = ({
    isOpen,
    onOpenChange,
    modelSettings,
    setModelSettings,
    uiSettings,
    setUISettings,
    availableModels = [],
    onClearHistory,
    onExportChat,
    defaultModelSettings,
    defaultUISettings,
}) => {
    const [localModelSettings, setLocalModelSettings] = useState<ModelSettings>({ ...modelSettings });
    const [localUISettings, setLocalUISettings] = useState<ChatUISettings>({ ...uiSettings });
    const [activeTab, setActiveTab] = useState("model");
    const [hasChanges, setHasChanges] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
    const [pendingClose, setPendingClose] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLocalModelSettings({ ...modelSettings });
            setLocalUISettings({ ...uiSettings });
            setHasChanges(false);
        }
    }, [isOpen, modelSettings, uiSettings]);

    useEffect(() => {
        if (isOpen) {
            const modelSettingsChanged = JSON.stringify(localModelSettings) !== JSON.stringify(modelSettings);
            const uiSettingsChanged = JSON.stringify(localUISettings) !== JSON.stringify(uiSettings);
            setHasChanges(modelSettingsChanged || uiSettingsChanged);
        }
    }, [localModelSettings, localUISettings, modelSettings, uiSettings, isOpen]);

    useEffect(() => {
        if (!showUnsavedWarning && pendingClose) {
            onOpenChange(false);
            setPendingClose(false);
        }
    }, [showUnsavedWarning, pendingClose, onOpenChange]);

    const handleSave = () => {
        setModelSettings(localModelSettings);
        setUISettings(localUISettings);
        setHasChanges(false); // Explicitly set to false after saving
        onOpenChange(false);
    };

    const handleAttemptClose = () => {
        if (hasChanges) {
            setShowUnsavedWarning(true);
            setPendingClose(true);
        } else {
            onOpenChange(false);
        }
    };

    const handleCancelButton = () => {
        if (hasChanges) {
            setShowUnsavedWarning(true);
            setPendingClose(false); // Don't set pending close on explicit cancel click
        } else {
            onOpenChange(false);
        }
    };


    const handleConfirmDiscard = () => {
        setShowUnsavedWarning(false);
        // Reset state *before* closing if pending
        setLocalModelSettings({ ...modelSettings });
        setLocalUISettings({ ...uiSettings });
        setHasChanges(false); // Reset changes flag
        if (pendingClose) {
            onOpenChange(false);
            setPendingClose(false);
        }
    };

    const handleDialogInteraction = (open: boolean) => {
        if (!open) {
            handleAttemptClose();
        } else {
            onOpenChange(true);
        }
    };


    const handleReset = () => {
        if (activeTab === "model") {
            setLocalModelSettings({ ...defaultModelSettings, modelId: localModelSettings.modelId ?? modelSettings.modelId }); // Keep current model selection
        } else {
            setLocalUISettings({ ...defaultUISettings });
        }
    };


    const handleClearHistory = () => {
        setShowClearConfirm(true);
    };

    const handleConfirmClear = () => {
        setShowClearConfirm(false);
        if (onClearHistory) {
            onClearHistory();
        }
    };

    // UI helper components
    const SettingLabel = ({ children, tooltip }: { children: React.ReactNode; tooltip: string }) => (
        <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">{children}</span>
            <TooltipProvider>
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help opacity-70 hover:opacity-100 transition-opacity" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs" side="top">{tooltip}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );

    const SettingSlider = ({
        id,
        label,
        value,
        min,
        max,
        step,
        onChange,
        tooltip,
        formatValue = (v: number) => v.toFixed(1),
    }: {
        id: string;
        label: string;
        value: number;
        min: number;
        max: number;
        step: number;
        onChange: (value: number[]) => void;
        tooltip: string;
        formatValue?: (value: number) => string;
    }) => (
        <div className="space-y-2 pb-2">
            <div className="flex justify-between items-center">
                <SettingLabel tooltip={tooltip}>{label}</SettingLabel>
                <Badge variant="outline" className="font-mono h-6 min-w-[48px] flex items-center justify-center">
                    {formatValue(value)}
                </Badge>
            </div>
            <Slider
                id={id}
                min={min}
                max={max}
                step={step}
                value={[value]}
                onValueChange={onChange}
                className="h-2 cursor-pointer"
            />
        </div>
    );

    // Quick setting presets (same as before)
    const presets = [
        {
            name: "Creative",
            settings: {
                temperature: 1.2,
                topP: 0.9,
                frequencyPenalty: 0.6,
                presencePenalty: 0.6,
            },
        },
        {
            name: "Balanced",
            settings: {
                temperature: 0.7,
                topP: 1.0,
                frequencyPenalty: 0.0,
                presencePenalty: 0.0,
            },
        },
        {
            name: "Precise",
            settings: {
                temperature: 0.2,
                topP: 0.5,
                frequencyPenalty: 0,
                presencePenalty: 0,
            },
        },
    ];

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleDialogInteraction}>
                {/* ---- MODIFICATION START ---- */}
                <DialogContent className="sm:max-w-[650px] p-0 gap-0 max-h-[90vh] flex flex-col overflow-hidden">
                    {/* 1. Header: Fixed at the top, remove bottom padding */}
                    <DialogHeader className="p-6 pb-4 shrink-0 border-b"> {/* Added border-b */}
                        {/* ... header content (no changes inside) ... */}
                        <div className="flex justify-between items-start">
                            <div>
                                <DialogTitle className="text-xl flex items-center gap-2">
                                    <Settings2 className="h-5 w-5" />
                                    Settings
                                </DialogTitle>
                                <DialogDescription className="mt-1.5">
                                    Customize your AI experience and interface preferences
                                </DialogDescription>
                            </div>
                            {hasChanges && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                                    Unsaved Changes
                                </Badge>
                            )}
                        </div>
                    </DialogHeader>

                    {/* 2. Tabs Component: Takes remaining space, uses flex-col */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0"> {/* Added min-h-0 */}
                        {/* 3. Tabs List: Fixed below header, outside ScrollArea */}
                        <div className="px-6 pt-4 pb-4 shrink-0"> {/* Adjusted padding */}
                            <TabsList className="w-full grid grid-cols-2">
                                <TabsTrigger value="model" className="flex items-center gap-2">
                                    <BrainCircuit className="h-4 w-4" />
                                    <span>AI Model</span>
                                </TabsTrigger>
                                <TabsTrigger value="interface" className="flex items-center gap-2">
                                    <PanelLeft className="h-4 w-4" />
                                    <span>Interface</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* 4. Scroll Area: Wraps TabsContent, takes remaining space, provides padding */}
                        <ScrollArea className="flex-1 px-6 pb-6 h-full"> {/* Scrollable content area with padding */}
                            {/* TabsContent remains largely the same, just inside ScrollArea */}
                            <TabsContent value="model" className="mt-0 outline-none space-y-6"> {/* Use mt-0 */}
                                {/* Model Selection Card */}
                                {availableModels && availableModels.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <BrainCircuit className="h-4 w-4" />
                                                Model Selection
                                            </CardTitle>
                                            <CardDescription>Choose the AI model that best fits your needs</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 gap-3">
                                                {availableModels.map((model) => (
                                                    <div
                                                        key={model.id}
                                                        className={cn(
                                                            "border rounded-lg p-3 cursor-pointer transition-all hover:border-primary/50",
                                                            localModelSettings.modelId === model.id ? "border-primary bg-primary/5" : "border-border"
                                                        )}
                                                        onClick={() => setLocalModelSettings((s) => ({ ...s, modelId: model.id }))}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div className="font-medium">{model.name}</div>
                                                            {model.isDefault && <Badge variant="outline" className="text-xs">Default</Badge>}
                                                        </div>
                                                        {model.description && <p className="text-sm text-muted-foreground mt-1">{model.description}</p>}
                                                        {model.capabilities && (
                                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                                {model.capabilities.map((capability, i) => (
                                                                    <Badge key={i} variant="secondary" className="text-xs font-normal">
                                                                        {capability}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Parameter Presets */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Sparkles className="h-4 w-4" />
                                            Quick Presets
                                        </CardTitle>
                                        <CardDescription>Apply preset parameter combinations for different use cases</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-3">
                                            {presets.map((preset) => (
                                                <Button
                                                    key={preset.name}
                                                    variant="outline"
                                                    className="h-auto py-2 flex flex-col items-center justify-center text-center"
                                                    onClick={() => setLocalModelSettings((s) => ({ ...s, ...preset.settings }))}
                                                >
                                                    <span className="font-medium">{preset.name}</span>
                                                    <span className="text-xs text-muted-foreground mt-1">
                                                        {preset.name === "Creative" && "More varied"}
                                                        {preset.name === "Balanced" && "Default"}
                                                        {preset.name === "Precise" && "More focused"}
                                                    </span>
                                                </Button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* System Prompt Card */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            System Prompt
                                        </CardTitle>
                                        <CardDescription>Define how the AI should behave and respond</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Textarea
                                            id="system-prompt"
                                            placeholder="You are a helpful, creative, and knowledgeable AI assistant..."
                                            value={localModelSettings.systemPrompt}
                                            onChange={(e) => setLocalModelSettings((s) => ({ ...s, systemPrompt: e.target.value }))}
                                            className="min-h-[100px] text-sm font-mono"
                                            rows={4}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1.5">Guides the overall tone and behavior of the AI.</p>
                                    </CardContent>
                                </Card>

                                {/* Model Parameters Card */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <SlidersHorizontal className="h-4 w-4" />
                                            Response Parameters
                                        </CardTitle>
                                        <CardDescription>Fine-tune how the AI generates responses</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <SettingSlider
                                            id="temperature"
                                            label="Temperature"
                                            value={localModelSettings.temperature}
                                            min={0}
                                            max={2.0}
                                            step={0.1}
                                            onChange={(value) => setLocalModelSettings((s) => ({ ...s, temperature: value[0] }))}
                                            tooltip="Controls randomness. Lower values make the output more focused and deterministic; higher values make it more creative."
                                        />
                                        <SettingSlider
                                            id="top-p"
                                            label="Top P"
                                            value={localModelSettings.topP}
                                            min={0}
                                            max={1}
                                            step={0.05}
                                            onChange={(value) => setLocalModelSettings((s) => ({ ...s, topP: value[0] }))}
                                            tooltip="Nucleus sampling parameter. The model considers only the tokens comprising the top P probability mass."
                                            formatValue={(v) => v.toFixed(2)}
                                        />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                            <SettingSlider
                                                id="freq-penalty"
                                                label="Frequency Penalty"
                                                value={localModelSettings.frequencyPenalty}
                                                min={-2.0}
                                                max={2.0}
                                                step={0.1}
                                                onChange={(value) => setLocalModelSettings((s) => ({ ...s, frequencyPenalty: value[0] }))}
                                                tooltip="Positive values penalize new tokens based on their existing frequency in the text so far, decreasing repetition."
                                            />
                                            <SettingSlider
                                                id="pres-penalty"
                                                label="Presence Penalty"
                                                value={localModelSettings.presencePenalty}
                                                min={-2.0}
                                                max={2.0}
                                                step={0.1}
                                                onChange={(value) => setLocalModelSettings((s) => ({ ...s, presencePenalty: value[0] }))}
                                                tooltip="Positive values penalize new tokens based on whether they appear in the text so far, increasing the likelihood of talking about new topics."
                                            />
                                        </div>
                                        <div className="flex justify-between items-center pt-1">
                                            <SettingLabel tooltip="Maximum number of tokens (roughly words/punctuation) the AI will generate in its response.">
                                                Max Response Tokens
                                            </SettingLabel>
                                            <Input
                                                id="max-tokens"
                                                type="number"
                                                min={1}
                                                max={16384}
                                                step={64}
                                                value={localModelSettings.maxTokens}
                                                onChange={(e) => {
                                                    const numValue = parseInt(e.target.value, 10);
                                                    if (!isNaN(numValue) && numValue > 0 && numValue <= 16384) {
                                                        setLocalModelSettings((s) => ({ ...s, maxTokens: numValue }));
                                                    } else if (e.target.value === '') { // Allow clearing the input
                                                        setLocalModelSettings((s) => ({ ...s, maxTokens: 1 })); // Or set to a default min
                                                    }
                                                }}
                                                className="w-24 h-8 text-sm text-right font-mono"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="interface" className="mt-0 outline-none space-y-6"> {/* Use mt-0 */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <PanelLeft className="h-4 w-4" />
                                            Interface Preferences
                                        </CardTitle>
                                        <CardDescription>Customize your chat experience</CardDescription>
                                    </CardHeader>
                                    {/* Use Divs with border for structure */}
                                    <div className="divide-y border-t">
                                        <div className="flex items-center justify-between px-6 py-4">
                                            <SettingLabel tooltip="Display timestamps for each message in the chat">
                                                Show Message Timestamps
                                            </SettingLabel>
                                            <Switch
                                                id="timestamps-switch"
                                                checked={!!localUISettings.showTimestamps}
                                                onCheckedChange={(checked) => setLocalUISettings((s) => ({ ...s, showTimestamps: checked }))}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between px-6 py-4">
                                            <SettingLabel tooltip="Use a more dense message layout to fit more content on screen">
                                                Compact Message Layout
                                            </SettingLabel>
                                            <Switch
                                                id="compact-switch"
                                                checked={!!localUISettings.compactMode}
                                                onCheckedChange={(checked) => setLocalUISettings((s) => ({ ...s, compactMode: checked }))}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between px-6 py-4">
                                            <SettingLabel tooltip="Automatically scroll to new messages as they appear">
                                                Auto-scroll to New Messages
                                            </SettingLabel>
                                            <Switch
                                                id="autoscroll-switch"
                                                checked={!!localUISettings.autoScroll}
                                                onCheckedChange={(checked) => setLocalUISettings((s) => ({ ...s, autoScroll: checked }))}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between px-6 py-4">
                                            <SettingLabel tooltip="Enable keyboard shortcuts for faster interaction (e.g., Ctrl+Enter to send)">
                                                Keyboard Shortcuts
                                            </SettingLabel>
                                            <Switch
                                                id="keyboard-shortcuts-switch"
                                                checked={!!localUISettings.enableKeyboardShortcuts}
                                                onCheckedChange={(checked) => setLocalUISettings((s) => ({ ...s, enableKeyboardShortcuts: checked }))}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between px-6 py-4">
                                            <SettingLabel tooltip="Render message content using Markdown formatting">
                                                Enable Markdown Rendering
                                            </SettingLabel>
                                            <Switch
                                                id="markdown-switch"
                                                checked={!!localUISettings.enableMarkdown}
                                                onCheckedChange={(checked) => setLocalUISettings((s) => ({ ...s, enableMarkdown: checked }))}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between px-6 py-4">
                                            <SettingLabel tooltip="Play subtle sounds when new messages arrive or actions occur">
                                                Message Sound Effects
                                            </SettingLabel>
                                            <Switch
                                                id="sound-switch"
                                                checked={!!localUISettings.messageSounds}
                                                onCheckedChange={(checked) => setLocalUISettings((s) => ({ ...s, messageSounds: checked }))}
                                            />
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <RefreshCw className="h-4 w-4" />
                                            Session Management
                                        </CardTitle>
                                        <CardDescription>Manage your current chat session data</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={onExportChat}
                                                disabled={!onExportChat}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Export Chat
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={handleClearHistory}
                                                disabled={!onClearHistory}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Clear History
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground px-1">Export downloads the current conversation. Clearing history cannot be undone.</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </ScrollArea> {/* End ScrollArea */}

                        {/* 5. Footer: Fixed at the bottom */}
                        <div className="p-6 pt-4 border-t flex items-center justify-between shrink-0">
                            {/* ... footer content (no changes inside) ... */}
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
                                    <Undo2 className="h-4 w-4 mr-1" /> Reset Tab
                                </Button>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" onClick={handleCancelButton}>Cancel</Button>
                                <Button onClick={handleSave} disabled={!hasChanges}>
                                    <Save className="mr-2 h-4 w-4" /> Save Changes
                                </Button>
                            </div>
                        </div>
                    </Tabs> {/* End Tabs */}
                </DialogContent>
                {/* ---- MODIFICATION END ---- */}
            </Dialog>

            {/* --- Confirmation Dialogs (No changes needed here) --- */}
            <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
                {/* ... content ... */}
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Unsaved Changes
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes in the settings. Are you sure you want to close without saving? Your changes will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setShowUnsavedWarning(false); setPendingClose(false); }}>
                            Keep Editing
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDiscard} variant='destructive'>
                            Discard Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
                {/* ... content ... */}
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Clear Chat History?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete all messages in the current chat session. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowClearConfirm(false)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmClear} className={cn(
                            "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        )}>
                            Clear History
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default ChatSettingsDialog;