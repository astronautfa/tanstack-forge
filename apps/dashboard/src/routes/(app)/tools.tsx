import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowUp,
  Bot,
  Check,
  ChevronDown,
  Clipboard,
  ClipboardCheck,
  Loader2, Paperclip,
  Plus,
  RefreshCcw,
  Settings,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  User, Wand2,
  X,
  Zap,
  FileText,
  Edit3
} from 'lucide-react';

import { Button } from "@app/ui/components/button";
import { Badge } from "@app/ui/components/badge";
import { Textarea } from "@app/ui/components/textarea";
import { ScrollArea } from "@app/ui/components/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@app/ui/components/tooltip";
import { Card, CardContent } from "@app/ui/components/card";
import { Avatar, AvatarFallback } from "@app/ui/components/avatar";
import {
  Dialog,
  DialogTrigger,
} from "@app/ui/components/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@app/ui/components/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@app/ui/components/command";
import { cn } from "@app/ui/lib/utils";

import ChatSettingsDialog, {
  type ModelSettings as DialogModelSettings,
  type ChatUISettings as DialogChatUISettings,
  type ModelOption
} from '@/components/chat-settings-dialog';

// --- Type Definitions ---

interface FilePreview {
  id: string;
  name: string;
  type: string;
  size: number;
  previewUrl?: string | null;
  fileObject: File;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  files?: { name: string; type: string; size: number }[];
  feedback?: 'good' | 'bad' | null;
  isLoading?: boolean;
}

interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  tags: string[];
  icon?: React.ElementType;
  strengths: string[];
  limitations?: string[];
  contextWindow?: number;
  supportsFiles?: boolean;
}

// UPDATED ModelSettings interface to match the new dialog's expected structure
interface ModelSettings extends DialogModelSettings {
  // Inherits: systemPrompt, temperature, maxTokens, topP, frequencyPenalty, presencePenalty, modelId?
}

// UPDATED ChatUISettings interface to include new fields
interface ChatUISettings extends DialogChatUISettings {
  // Inherits: showTimestamps, compactMode, autoScroll
  // New: darkMode?, enableKeyboardShortcuts?, messageSounds?, enableMarkdown?
}

// --- Mock Data & Defaults ---

const availableModels: Model[] = [
  { id: "claude-35-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", description: "Balanced intelligence and speed, strong vision capabilities.", tags: ["Vision", "Balanced", "Latest"], icon: Wand2, strengths: ["Complex reasoning", "Nuanced content creation", "Code generation", "Vision analysis"], limitations: ["Potential for verbosity"], contextWindow: 200000, supportsFiles: true },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", description: "Flagship multimodal model, optimized for speed and cost.", tags: ["Multimodal", "Fast", "Flagship"], icon: Zap, strengths: ["Text, audio, image understanding", "Conversational AI", "Broad knowledge"], contextWindow: 128000, supportsFiles: true },
  { id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic", description: "Most powerful model for highly complex tasks.", tags: ["Powerful", "Reasoning", "Large Context"], icon: Sparkles, strengths: ["Top-tier reasoning", "Math & coding", "Long context understanding"], contextWindow: 200000, supportsFiles: true },
  { id: "llama-3-70b", name: "Llama 3 70B", provider: "Meta", description: "Large open-source model, great for research and customization.", tags: ["Open Source", "Large"], icon: Bot, strengths: ["Strong general performance", "Good instruction following"], contextWindow: 8000, supportsFiles: false },
  { id: "claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic", description: "Fastest and most compact model for near-instant responsiveness.", tags: ["Fast", "Compact", "Affordable"], icon: Wand2, strengths: ["Quick responses", "Simple summarization", "Customer interactions"], contextWindow: 200000, supportsFiles: true },
];

const defaultModelSettings: ModelSettings = {
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1.0,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  systemPrompt: "You are a helpful AI assistant.",
  modelId: availableModels[0].id,
};

const defaultUISettings: ChatUISettings = {
  showTimestamps: true,
  compactMode: false,
  autoScroll: true,
  darkMode: false,
  enableKeyboardShortcuts: true,
  messageSounds: false,
  enableMarkdown: true,
};

const MAX_FILE_SIZE_MB = 25;
const MAX_FILES = 5;

// --- Route Definition ---
export const Route = createFileRoute('/(app)/tools')({
  component: ModernAIChatComponent,
});

// --- Main Component ---
function ModernAIChatComponent() {
  // --- State ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model>(availableModels[0]);
  // Use updated interfaces for state
  const [modelSettings, setModelSettings] = useState<ModelSettings>(() => ({
    ...defaultModelSettings,
    modelId: availableModels[0].id, // Ensure initial modelId is set
  }));
  const [uiSettings, setUISettings] = useState<ChatUISettings>(defaultUISettings);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState<boolean>(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState<string>("New Chat");

  // --- Refs ---
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([createInitialAssistantMessage(selectedModel)]);
    }
  }, []); // Keep initial message logic

  useEffect(() => {
    if (uiSettings.autoScroll && scrollAreaRef.current) {
      setTimeout(() => {
        // Access the viewport element directly if using shadcn's ScrollArea structure
        const scrollViewport = scrollAreaRef.current?.querySelector<HTMLElement>('[data-radix-scroll-area-viewport]');
        if (scrollViewport) {
          scrollViewport.scrollTop = scrollViewport.scrollHeight;
        }
      }, 0);
    }
  }, [messages, isProcessing, uiSettings.autoScroll]);


  useEffect(() => {
    const currentUrls = selectedFiles.map(f => f.previewUrl).filter(Boolean) as string[];
    return () => {
      currentUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  // EFFECT to update selectedModel when modelId changes in settings
  useEffect(() => {
    if (modelSettings.modelId && modelSettings.modelId !== selectedModel.id) {
      const newModel = availableModels.find(m => m.id === modelSettings.modelId);
      if (newModel) {
        setSelectedModel(newModel);
        console.log("Model changed via settings to:", newModel.name);
        // Optionally update welcome message if chat is pristine
        if (messages.length === 1 && messages[0].role === 'assistant' && !messages[0].isLoading) {
          setMessages([createInitialAssistantMessage(newModel)]);
        }
      }
    }
  }, [modelSettings.modelId]); // Dependency on modelId in settings


  // --- Helper Functions ---
  const createInitialAssistantMessage = (model: Model): Message => ({
    id: crypto.randomUUID(),
    role: 'assistant',
    content: `Hello! I'm ${model.name}. How can I assist you today? I'm using the current settings. System Prompt: "${modelSettings.systemPrompt.substring(0, 50)}..."`, // Reflect system prompt
    timestamp: new Date().toISOString(),
    modelUsed: model.name,
  });

  const generateUniqueId = (): string => crypto.randomUUID();

  // UPDATED generateDummyResponse to use modelSettings
  const generateDummyResponse = useCallback((input: string, files?: FilePreview[], currentModel?: Model, settings?: ModelSettings): string => {
    const modelName = currentModel?.name || "AI";
    const temp = settings?.temperature ?? defaultModelSettings.temperature;
    const maxTok = settings?.maxTokens ?? defaultModelSettings.maxTokens;
    const sysPrompt = settings?.systemPrompt ?? defaultModelSettings.systemPrompt;

    const creativity = temp > 1.0 ? "highly creative" : temp > 0.5 ? "balanced" : "focused";

    const baseResponses = [
      `(${modelName}, ${creativity}) Re: "${input.substring(0, 30)}...", considering the prompt "${sysPrompt.substring(0, 40)}...", my analysis suggests... (max_tokens: ${maxTok})`,
      `(${modelName}, ${creativity}) Interesting point: "${input.substring(0, 30)}...". Based on my instructions ("${sysPrompt.substring(0, 40)}..."), I'd say... (max_tokens: ${maxTok})`,
      `(${modelName}, ${creativity}) Processing "${input.substring(0, 30)}..." with prompt "${sysPrompt.substring(0, 40)}...". Output limited to ${maxTok} tokens. Here are my thoughts...`,
    ];
    const fileText = files && files.length > 0
      ? `\n\nNoted ${files.length} file(s): ${files.map(f => f.name).join(', ')}. ${currentModel?.supportsFiles ? 'Context considered.' : `Note: ${modelName} simulation cannot process file content.`}`
      : '';
    const randomResponse = baseResponses[Math.floor(Math.random() * baseResponses.length)];
    return `${randomResponse}${fileText}\n\n_Disclaimer: Simulated response reflecting settings._`;
  }, []); // Dependency removed as settings are passed directly

  // --- Event Handlers ---
  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage && selectedFiles.length === 0) return;

    setIsProcessing(true);
    const timestamp = new Date().toISOString();
    const userMessageId = generateUniqueId();

    if (messages.length === 1 && messages[0].role === 'assistant' && !messages[0].isLoading) {
      const newTitle = trimmedMessage.substring(0, 50) || `Chat ${new Date().toLocaleDateString()}`;
      setChatTitle(newTitle);
    }

    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: trimmedMessage,
      timestamp: timestamp,
      files: selectedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    const filesForRequest = [...selectedFiles];
    setNewMessage('');
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    filesForRequest.forEach(f => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });

    const assistantMessageId = generateUniqueId();
    const assistantPlaceholder: Message = {
      id: assistantMessageId, role: 'assistant', content: "",
      timestamp: new Date().toISOString(), modelUsed: selectedModel.name,
      isLoading: true,
    };

    setMessages(prev => [...prev, assistantPlaceholder]);

    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Pass current modelSettings to the dummy response generator
    const aiResponseContent = generateDummyResponse(trimmedMessage, filesForRequest, selectedModel, modelSettings);

    const finalAssistantMessage: Message = {
      ...assistantPlaceholder,
      content: aiResponseContent,
      timestamp: new Date().toISOString(),
      isLoading: false,
    };

    setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? finalAssistantMessage : msg));
    setIsProcessing(false);

  }, [newMessage, selectedFiles, messages, selectedModel, modelSettings, generateDummyResponse]); // Added modelSettings dependency

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Use uiSettings to check if shortcuts are enabled
    if (uiSettings.enableKeyboardShortcuts && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    // Could add more shortcuts here based on uiSettings.enableKeyboardShortcuts
  };

  // handleFileChange, removeFile remain the same...
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentFileCount = selectedFiles.length;
    const availableSlots = MAX_FILES - currentFileCount;

    if (availableSlots <= 0) {
      console.warn("Maximum number of files reached.");
      return;
    }

    const addedFiles: FilePreview[] = [];
    let filesRejected = 0;

    Array.from(files).slice(0, availableSlots).forEach(file => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        console.warn(`File ${file.name} exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
        filesRejected++;
        return;
      }

      const fileId = generateUniqueId();
      const isImage = file.type.startsWith('image/');
      let previewUrl: string | null = null;

      if (isImage) {
        previewUrl = URL.createObjectURL(file);
      }

      addedFiles.push({
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        previewUrl,
        fileObject: file
      });
    });

    if (files.length > availableSlots) {
      console.warn(`Added ${availableSlots} files. ${files.length - availableSlots + filesRejected} files were rejected (limit or size).`);
    } else if (filesRejected > 0) {
      console.warn(`${filesRejected} files were rejected due to size limit.`);
    }

    setSelectedFiles(prev => [...prev, ...addedFiles]);
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter(f => f.id !== fileId);
    });
    if (selectedFiles.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  const handleStartNewChat = () => {
    // Reset model settings to default? Or keep current? Keep current for now.
    // Reset UI settings to default? Or keep current? Keep current.
    setMessages([createInitialAssistantMessage(selectedModel)]);
    setNewMessage('');
    selectedFiles.forEach(f => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });
    setSelectedFiles([]);
    setChatTitle("New Chat");
    inputRef.current?.focus();
  };

  const handleCopyMessage = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 1500);
    });
  };

  const handleRegenerateResponse = () => {
    let lastUserMessageIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMessageIndex = i;
        break;
      }
    }
    if (lastUserMessageIndex === -1) return;

    const lastUserMessage = messages[lastUserMessageIndex];
    const filesForRegen = lastUserMessage.files?.map(f => ({ ...f, id: generateUniqueId(), fileObject: new File([], f.name, { type: f.type }) })) as FilePreview[] | undefined;

    const messagesToKeep = messages.slice(0, lastUserMessageIndex + 1);
    setMessages(messagesToKeep);

    setIsProcessing(true);
    setTimeout(async () => {
      const assistantMessageId = generateUniqueId();
      const assistantPlaceholder: Message = {
        id: assistantMessageId, role: 'assistant', content: "", timestamp: new Date().toISOString(),
        modelUsed: selectedModel.name, isLoading: true,
      };
      setMessages(prev => [...prev, assistantPlaceholder]);

      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
      // Pass current modelSettings for regeneration
      const aiResponseContent = generateDummyResponse(lastUserMessage.content, filesForRegen, selectedModel, modelSettings);

      const finalAssistantMessage: Message = {
        ...assistantPlaceholder,
        content: aiResponseContent + "\n\n_(Regenerated response)_",
        timestamp: new Date().toISOString(), isLoading: false,
      };

      setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? finalAssistantMessage : msg));
      setIsProcessing(false);
    }, 100);
  };


  const handleFeedback = (messageId: string, feedback: 'good' | 'bad') => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, feedback: msg.feedback === feedback ? null : feedback } : msg
      )
    );
    console.log(`Feedback for message ${messageId}: ${feedback}`);
  };

  // Placeholder functions for new settings actions
  const handleClearHistory = useCallback(() => {
    console.log("Action: Clear History triggered");
    // Implement actual logic: confirmation + clearing messages array
    setMessages([createInitialAssistantMessage(selectedModel)]); // Simple reset for now
    setChatTitle("New Chat"); // Reset title
    console.log("Chat history cleared (mock).");
    setIsSettingsDialogOpen(false); // Close dialog after action
  }, [selectedModel, modelSettings.systemPrompt]); // Dependency needed

  const handleExportChat = useCallback(() => {
    console.log("Action: Export Chat triggered");
    // Implement actual logic: format messages + trigger download
    const chatContent = messages.map(m => `[${m.role} - ${m.timestamp}] ${m.content}`).join('\n\n');
    const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${chatTitle.replace(/ /g, '_')}_export_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    console.log("Chat exported (mock).");
  }, [messages, chatTitle]);


  // Map availableModels (Model[]) to ModelOption[] for the dialog
  const modelOptions: ModelOption[] = availableModels.map(model => ({
    id: model.id,
    name: model.name,
    description: model.description,
    // Use tags or strengths as capabilities
    capabilities: [...model.tags, ...(model.strengths?.slice(0, 1) || [])],
    // Check if it's the very first model in the original list
    isDefault: model.id === availableModels[0].id
  }));


  // --- Render ---
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">

        {/* Chat Header */}
        <header className="border-b p-3 flex items-center justify-between h-16 shrink-0 z-10 bg-background">
          <div className="flex items-center gap-2">
            {/* Existing header elements */}
            <ModelIcon model={selectedModel} className="size-5 text-muted-foreground shrink-0" />
            <span className="font-medium text-md truncate">{chatTitle}</span>
            <Tooltip>
              <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><Edit3 className="h-3 w-3 text-muted-foreground hover:text-foreground" /></Button></TooltipTrigger>
              <TooltipContent>Rename Chat</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleStartNewChat} className="h-9 w-9">
                  <Plus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New Chat</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            {/* Model Selector remains */}
            <ModelSelector
              availableModels={availableModels}
              selectedModel={selectedModel}
              onSelectModel={(model) => {
                setSelectedModel(model);
                // Update modelId in settings state when selected via dropdown
                setModelSettings(prev => ({ ...prev, modelId: model.id }));
                if (messages.length === 1 && messages[0].role === 'assistant' && !messages[0].isLoading) {
                  setMessages([createInitialAssistantMessage(model)]);
                }
              }}
            />
            {/* Settings Dialog Trigger using original Settings icon */}
            <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Settings className="h-5 w-5" /> {/* Use original icon for trigger */}
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>

              {/* Render the NEW ChatSettingsDialog */}
              {/* Pass required props including mapped models and new handlers */}
              <ChatSettingsDialog
                isOpen={isSettingsDialogOpen}
                onOpenChange={setIsSettingsDialogOpen}
                modelSettings={modelSettings} // Pass the full model settings state
                setModelSettings={setModelSettings} // Pass the state setter
                uiSettings={uiSettings}
                setUISettings={setUISettings}
                availableModels={modelOptions} // Pass the mapped ModelOption[]
                onClearHistory={handleClearHistory} // Pass the clear handler
                onExportChat={handleExportChat} // Pass the export handler
                // Pass defaults for reset functionality in dialog
                defaultModelSettings={defaultModelSettings}
                defaultUISettings={defaultUISettings}
              />
            </Dialog>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1" ref={scrollAreaRef}> {/* Ensure ref is on ScrollArea */}
          <div className="max-w-4xl mx-auto px-4 pt-6 pb-10 space-y-4">
            {messages.length <= 1 && !isProcessing && !messages.some(m => m.role === 'user') && (
              <ChatWelcomeSuggestions onSuggestionClick={(text) => { setNewMessage(text); inputRef.current?.focus(); }} />
            )}

            {messages.map((message, index) => (
              <MessageItem
                key={message.id}
                message={message}
                selectedModel={selectedModel} // Pass the current selected Model object
                isLastMessage={index === messages.length - 1 && message.role === 'assistant'}
                onCopy={handleCopyMessage}
                copiedMessageId={copiedMessageId}
                onRegenerate={handleRegenerateResponse}
                onFeedback={handleFeedback}
                showTimestamp={uiSettings.showTimestamps} // Use state value
                isCompact={uiSettings.compactMode} // Use state value
              // Pass markdown setting if MessageItem will handle rendering
              // enableMarkdown={uiSettings.enableMarkdown}
              />
            ))}
            <div ref={messageEndRef} className="h-px" />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <footer className="border-t pt-3 shrink-0 bg-background/95 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto space-y-3">
            {/* File Preview Area - unchanged */}
            {selectedFiles.length > 0 && (
              <ScrollArea className="max-h-40 w-full">
                <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-muted/40">
                  {selectedFiles.map((file) =>
                    file.previewUrl ? (
                      <ImagePreviewBadge key={file.id} file={file} onRemove={removeFile} />
                    ) : (
                      <FilePreviewBadge key={file.id} file={file} onRemove={removeFile} />
                    )
                  )}
                </div>
              </ScrollArea>
            )}

            {/* Input Form - unchanged */}
            <div className="relative flex items-end gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-10 w-10 rounded-full disabled:opacity-50"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!selectedModel.supportsFiles || isProcessing || selectedFiles.length >= MAX_FILES}
                    aria-label="Attach file"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{
                  selectedFiles.length >= MAX_FILES ? `Maximum ${MAX_FILES} files reached`
                    : !selectedModel.supportsFiles ? "Model does not support files"
                      : `Attach files (Max ${MAX_FILE_SIZE_MB}MB each)`}
                </TooltipContent>
              </Tooltip>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf,.txt,.csv,.json,.xml,.html,.css,.js,.ts,.jsx,.tsx,.py,.java,.c,.cpp,.cs,.rb,.php,.swift,.kt,.md,.docx,.xlsx,.pptx"
              />
              <div className="relative flex-1">
                <Textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown} // Uses updated handler with shortcut check
                  placeholder={`Message ${selectedModel.name}... ${uiSettings.enableKeyboardShortcuts ? '(Enter to send, Shift+Enter for newline)' : ''}`}
                  className="min-h-[44px] max-h-[250px] pr-4 pl-3 py-2.5 resize-none overflow-y-auto rounded-xl border-border focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 shadow-sm bg-background"
                  rows={1}
                />
              </div>
              <Button
                type="button"
                onClick={handleSendMessage}
                disabled={(!newMessage.trim() && selectedFiles.length === 0) || isProcessing}
                className="shrink-0 h-10 w-10 rounded-full p-0 flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground"
                aria-label="Send message"
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowUp className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Footer Info - unchanged */}
            <p className="text-xs text-center text-muted-foreground px-4">
              AI responses can be inaccurate. Verify important information. Model: {selectedModel.name} ({selectedModel.provider})
            </p>
          </div>
        </footer>

      </div>
    </TooltipProvider>
  );
}

// --- Sub Components --- (Keep ModelIcon, ModelSelector, MessageItem, FilePreviewBadge, ImagePreviewBadge, ChatWelcomeSuggestions as they were)

// Model Icon Helper
const ModelIcon: React.FC<{ model: Model, className?: string }> = ({ model, className }) => {
  const IconComponent = model.icon || Bot; // Default to Bot icon
  return <IconComponent className={cn("h-4 w-4", className)} />;
};

// Model Selector Popover (Top Right)
interface ModelSelectorProps {
  availableModels: Model[];
  selectedModel: Model;
  onSelectModel: (model: Model) => void;
}
const ModelSelector: React.FC<ModelSelectorProps> = ({ availableModels, selectedModel, onSelectModel }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 px-2 h-9">
          <ModelIcon model={selectedModel} className="h-4 w-4 shrink-0" />
          <span className="font-medium truncate max-w-[100px] sm:max-w-[180px] text-sm">{selectedModel.name}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-0.5 opacity-75 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup heading="Available Models">
              {availableModels.map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.name} // Use name for search/value, id for selection logic
                  onSelect={() => {
                    onSelectModel(model); // Call the handler with the full Model object
                    setIsOpen(false);
                  }}
                  className="cursor-pointer aria-selected:bg-accent group"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <ModelIcon model={model} className="h-5 w-5 group-aria-selected:text-foreground text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{model.name}</p>
                        <p className="text-xs text-muted-foreground">{model.provider}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[45%]">
                      {model.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {selectedModel.id === model.id && (
                    <Check className="ml-auto h-4 w-4 text-primary pl-2" /> // Position check correctly
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// Message Item Component
interface MessageItemProps {
  message: Message;
  selectedModel: Model;
  isLastMessage: boolean;
  onCopy: (content: string, messageId: string) => void;
  copiedMessageId: string | null;
  onRegenerate: () => void;
  onFeedback: (messageId: string, feedback: 'good' | 'bad') => void;
  showTimestamp: boolean;
  isCompact: boolean;
  // enableMarkdown?: boolean; // Optional: Add if markdown rendering logic is inside
}

const MessageItem: React.FC<MessageItemProps> = React.memo(({ message, selectedModel, isLastMessage, onCopy, copiedMessageId, onRegenerate, onFeedback, showTimestamp, isCompact }) => {
  const isUser = message.role === 'user';
  const CopyIcon = copiedMessageId === message.id ? ClipboardCheck : Clipboard;
  // Ensure modelUsed lookup uses the correct list and fallback
  const modelForMessage = availableModels.find(m => m.name === message.modelUsed) || selectedModel;


  const messagePadding = isCompact ? 'px-3 py-2' : 'px-4 py-3';

  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    } catch (e) {
      return "Invalid date"; // Fallback for invalid timestamp
    }
  };

  // Simple Markdown rendering placeholder (replace with a proper library like react-markdown if needed)
  const renderContent = (content: string, enableMarkdown?: boolean) => {
    if (!enableMarkdown) {
      // Basic paragraph splitting for non-markdown
      return content.split('\n').map((paragraph, idx) => (
        <p key={idx} className={idx > 0 ? "mt-2" : ""}>{paragraph || '\u00A0'}</p>
      ));
    }

    // VERY basic Markdown simulation (bold, italic, code) - USE A LIBRARY FOR REAL MARKDOWN
    let processedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/`(.*?)`/g, '<code>$1</code>'); // Inline code

    // Split into paragraphs and render with dangerouslySetInnerHTML (USE WITH CAUTION or a sanitizer)
    return processedContent.split('\n').map((paragraph, idx) => (
      <p key={idx} className={idx > 0 ? "mt-2" : ""} dangerouslySetInnerHTML={{ __html: paragraph || ' ' }} />
    ));
  };


  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex gap-2.5 max-w-[85%]', isUser ? 'flex-row-reverse' : 'flex-row')}>
        <Avatar className={cn('h-7 w-7 border shrink-0', isUser ? 'mt-auto' : '')}>
          <AvatarFallback className={cn(isUser ? 'bg-primary/10' : 'bg-muted')}>
            {isUser ? (
              <User className="h-4 w-4 text-primary" />
            ) : (
              <ModelIcon model={modelForMessage} className="h-4 w-4 text-foreground" />
            )}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <div
            className={cn(
              "relative group flex flex-col rounded-xl shadow-sm",
              messagePadding,
              isUser
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-muted text-foreground rounded-bl-sm'
            )}
          >
            {!isUser && !isCompact && (
              <div className="text-xs font-medium mb-1.5 text-muted-foreground">{modelForMessage.name}</div>
            )}

            {/* Use prose for better typography and render content */}
            <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed">
              {message.isLoading ? (
                <div className="flex items-center space-x-1 py-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse animation-delay-[-0.3s]"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse animation-delay-[-0.15s]"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></div>
                </div>
              ) : (
                // Example: Pass uiSettings.enableMarkdown here if managed globally
                // For now, assuming 'true' for demo, replace with actual prop if needed
                renderContent(message.content, true /* uiSettings.enableMarkdown */)
              )}
            </div>


            {isUser && message.files && message.files.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-primary/20 pt-2">
                {message.files.map((file, index) => (
                  <Badge key={index} variant="secondary" className="text-xs py-0.5 px-1.5 bg-primary/10 hover:bg-primary/20 cursor-default"> {/* Made non-interactive */}
                    <FileText className="h-3 w-3 mr-1" />
                    {file.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action Buttons - No changes needed here */}
            {!isUser && !message.isLoading && (
              <div className="absolute -bottom-7 right-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => onCopy(message.content, message.id)}>
                      <CopyIcon className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{copiedMessageId === message.id ? "Copied!" : "Copy"}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className={cn("h-6 w-6 text-muted-foreground hover:text-emerald-500", message.feedback === 'good' ? 'text-emerald-500 bg-emerald-500/10' : '')} onClick={() => onFeedback(message.id, 'good')}>
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Good response</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className={cn("h-6 w-6 text-muted-foreground hover:text-red-500", message.feedback === 'bad' ? 'text-red-500 bg-red-500/10' : '')} onClick={() => onFeedback(message.id, 'bad')}>
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Bad response</TooltipContent>
                </Tooltip>
                {isLastMessage && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={onRegenerate}>
                        <RefreshCcw className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Regenerate</TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
          {showTimestamp && (
            <div className={cn('text-xs text-muted-foreground mt-1', isUser ? 'text-right' : 'text-left')}>
              {formatTimestamp(message.timestamp)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
MessageItem.displayName = 'MessageItem';


// Generic File Preview Badge
interface FilePreviewBadgeProps {
  file: FilePreview;
  onRemove: (fileId: string) => void;
}
const FilePreviewBadge: React.FC<FilePreviewBadgeProps> = ({ file, onRemove }) => {
  const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
  return (
    <div className="relative group flex items-center gap-1.5 pl-2 pr-1 py-1 h-8 rounded-md bg-muted border border-transparent hover:border-border text-xs max-w-[180px]">
      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="truncate shrink" title={file.name}>{file.name}</span>
      {/* Show size only if > 0.1 MB */}
      {parseFloat(fileSizeMB) > 0 && (
        <span className="text-muted-foreground/80 text-[10px] shrink-0">({fileSizeMB}MB)</span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full bg-background border border-border text-muted-foreground hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 z-10" // Ensure button is clickable
        onClick={() => onRemove(file.id)}
        aria-label={`Remove ${file.name}`}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

// Image File Preview Badge
const ImagePreviewBadge: React.FC<FilePreviewBadgeProps> = ({ file, onRemove }) => {
  return (
    <div className="relative group w-20 h-20 rounded-md overflow-hidden border bg-muted">
      {file.previewUrl && (
        <img
          src={file.previewUrl}
          alt={file.name}
          className="object-cover w-full h-full"
          loading="lazy"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1">
        <p className="text-xs text-white truncate" title={file.name}>{file.name}</p>
      </div>
      <Button
        variant="destructive" // More visible remove
        size="icon"
        className="absolute top-1 right-1 h-5 w-5 p-0 rounded-full opacity-0 group-hover:opacity-100 z-10" // Ensure button is clickable
        onClick={() => onRemove(file.id)}
        aria-label={`Remove ${file.name}`}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};


// Chat Welcome/Suggestions Component
interface ChatWelcomeSuggestionsProps {
  onSuggestionClick: (text: string) => void;
}
const ChatWelcomeSuggestions: React.FC<ChatWelcomeSuggestionsProps> = ({ onSuggestionClick }) => {
  const suggestions = [
    'Explain quantum computing simply',
    'Python script to scrape website data',
    'Ideas for a 10-day trip to Japan',
    'Compare React and Vue',
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full border bg-background p-4 mb-6 shadow-sm">
        <Wand2 className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold mb-4">How can I help you today?</h2>
      <p className="text-muted-foreground mb-6 max-w-md">Start chatting or try one of these examples:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mt-4">
        {suggestions.map((suggestion, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:bg-accent transition-colors group text-left shadow-sm hover:shadow-md"
            onClick={() => onSuggestionClick(suggestion)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <p className="text-sm font-medium flex-1">{suggestion}</p>
              <ArrowUp className="h-4 w-4 text-muted-foreground ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity -rotate-45 group-hover:rotate-0" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// REMOVED old ChatSettingsDialog component from here

export default ModernAIChatComponent;