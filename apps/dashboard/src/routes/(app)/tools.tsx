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
  Edit3,
  Image as ImageIcon // Added for image file type icon
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
} from '@/components/chat-settings-dialog'; // Assuming this path is correct

// --- Type Definitions ---

interface FilePreview {
  id: string;
  name: string;
  type: string;
  size: number;
  previewUrl?: string | null;
  fileObject: File;
}

interface MessageFile {
  name: string;
  type: string;
  size: number;
  previewUrl?: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  files?: MessageFile[];
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

interface ModelSettings extends DialogModelSettings { }
interface ChatUISettings extends DialogChatUISettings { }

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
  darkMode: false, // Assuming default is light mode
  enableKeyboardShortcuts: true,
  messageSounds: false,
  enableMarkdown: true,
};

const MAX_FILE_SIZE_MB = 25;
const MAX_FILES = 5;
const ANIMATION_SPEED_MS = 15; // Lower value = faster animation

// --- Utility Functions ---
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() !== now.toDateString()) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    }
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  } catch (e) {
    return "Invalid date";
  }
};

const generateUniqueId = (): string => crypto.randomUUID();

// --- Route Definition ---
export const Route = createFileRoute('/(app)/tools')({ // Make sure '/(app)/tools' matches your route structure
  component: ModernAIChatComponent,
});

// --- Main Component ---
function ModernAIChatComponent() {
  // --- State ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // Covers initial API wait/placeholder
  const [isStreamingResponse, setIsStreamingResponse] = useState(false); // Covers text animation
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model>(availableModels[0]);
  const [modelSettings, setModelSettings] = useState<ModelSettings>(() => ({
    ...defaultModelSettings,
    modelId: availableModels[0].id,
  }));
  const [uiSettings, setUISettings] = useState<ChatUISettings>(defaultUISettings);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState<boolean>(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState<string>("New Chat");

  // --- Refs ---
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null); // Ref for the ScrollArea's outer div

  // --- Effects ---
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([createInitialAssistantMessage(selectedModel)]);
    }
  }, []); // Only on mount if messages are empty

  // Auto-scroll effect
  useEffect(() => {
    if (uiSettings.autoScroll && scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current?.querySelector<HTMLElement>('[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        requestAnimationFrame(() => {
          scrollViewport.scrollTop = scrollViewport.scrollHeight;
        });
      }
    }
  }, [messages, isProcessing, isStreamingResponse, uiSettings.autoScroll]); // Trigger on state changes too

  // Update selectedModel when modelId changes in settings
  useEffect(() => {
    if (modelSettings.modelId && modelSettings.modelId !== selectedModel.id) {
      const newModel = availableModels.find(m => m.id === modelSettings.modelId);
      if (newModel) {
        setSelectedModel(newModel);
        if (messages.length === 1 && messages[0].role === 'assistant' && !messages[0].isLoading) {
          setMessages([createInitialAssistantMessage(newModel)]);
        }
      }
    }
  }, [modelSettings.modelId]); // Don't depend on `messages` here

  // Cleanup Object URLs on component unmount
  useEffect(() => {
    return () => {
      console.log("Chat component unmounting: Cleaning up Object URLs");
      messages.forEach(msg => {
        msg.files?.forEach(file => {
          if (file.previewUrl) { try { URL.revokeObjectURL(file.previewUrl); } catch (e) { console.warn(`Error revoking message file URL on unmount: ${file.previewUrl}`, e); } }
        });
      });
      selectedFiles.forEach(file => {
        if (file.previewUrl) { try { URL.revokeObjectURL(file.previewUrl); } catch (e) { console.warn(`Error revoking selected file URL on unmount: ${file.previewUrl}`, e); } }
      });
    };
  }, []); // Empty array ensures run only on unmount


  // --- Helper Functions ---
  const createInitialAssistantMessage = (model: Model): Message => ({
    id: generateUniqueId(),
    role: 'assistant',
    content: `Hello! I'm ${model.name}. How can I assist you today? I'm using the current settings. System Prompt: "${modelSettings.systemPrompt.substring(0, 50)}..."`,
    timestamp: new Date().toISOString(),
    modelUsed: model.name,
    isLoading: false,
  });

  // generateDummyResponse remains the same - it generates the *final* text
  const generateDummyResponse = useCallback((input: string, files?: MessageFile[], currentModel?: Model, settings?: ModelSettings): string => {
    const modelName = currentModel?.name || "AI";
    const temp = settings?.temperature ?? defaultModelSettings.temperature;
    const maxTok = settings?.maxTokens ?? defaultModelSettings.maxTokens;
    const sysPrompt = settings?.systemPrompt ?? defaultModelSettings.systemPrompt;
    const creativity = temp > 1.0 ? "highly creative" : temp > 0.5 ? "balanced" : "focused";
    const baseResponses = [
      `(${modelName}, ${creativity}) Re: "${input.substring(0, 30)}...", considering the prompt "${sysPrompt.substring(0, 40)}...", my analysis suggests a few key points based on the information provided. Firstly, the core concept revolves around... Secondly, we need to consider the implications of... Finally, a potential path forward involves... (Settings: temp=${temp}, max_tokens=${maxTok})`,
      `(${modelName}, ${creativity}) Interesting point: "${input.substring(0, 30)}...". Based on my instructions ("${sysPrompt.substring(0, 40)}..."), I'd approach this by breaking it down. The primary aspect is X. The secondary consideration involves Y. Therefore, the synthesized answer points towards Z. This is a complex topic with many nuances. (Settings: temp=${temp}, max_tokens=${maxTok})`,
      `(${modelName}, ${creativity}) Processing "${input.substring(0, 30)}..." with prompt "${sysPrompt.substring(0, 40)}...". Output limited to ${maxTok} tokens. Here are my thoughts: The situation described implies several factors at play. We observe A, B, and C. Based on these observations and the system prompt, a logical conclusion is D. Further exploration might involve E and F. (Settings: temp=${temp}, max_tokens=${maxTok})`,
    ];
    const fileText = files && files.length > 0
      ? `\n\nRegarding the ${files.length} file(s) (${files.map(f => f.name).join(', ')}): ${currentModel?.supportsFiles ? 'I have considered their context in this response.' : `Please note: ${modelName} (simulated) cannot process file content.`}`
      : '';
    const randomResponse = baseResponses[Math.floor(Math.random() * baseResponses.length)];
    return `${randomResponse}${fileText}\n\n_Disclaimer: Simulated response reflecting settings._`;
  }, []); // No dependencies needed as arguments cover variations


  // --- Event Handlers ---
  const handleAnimationComplete = useCallback(() => {
    setIsStreamingResponse(false);
    console.log("Animation complete, re-enabling input.");
    // Consider focusing input: inputRef.current?.focus();
  }, []);

  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage && selectedFiles.length === 0) return;

    setIsProcessing(true); // Start processing (covers placeholder/delay)
    const timestamp = new Date().toISOString();
    const userMessageId = generateUniqueId();

    if (messages.length === 1 && messages[0].role === 'assistant' && !messages[0].isLoading) {
      const newTitle = trimmedMessage.substring(0, 50) || `Chat ${new Date().toLocaleDateString()}`;
      setChatTitle(newTitle);
    }

    const messageFiles: MessageFile[] = selectedFiles.map(f => ({
      name: f.name, type: f.type, size: f.size,
      previewUrl: f.type.startsWith('image/') ? f.previewUrl : null
    }));

    const userMessage: Message = {
      id: userMessageId, role: 'user', content: trimmedMessage, timestamp: timestamp, files: messageFiles,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    setNewMessage('');
    setSelectedFiles([]); // Clear selection UI - URLs are kept in messageFiles
    if (fileInputRef.current) fileInputRef.current.value = "";

    const assistantMessageId = generateUniqueId();
    const assistantPlaceholder: Message = {
      id: assistantMessageId, role: 'assistant', content: "",
      timestamp: new Date().toISOString(), modelUsed: selectedModel.name,
      isLoading: true,
    };

    setMessages(prev => [...prev, assistantPlaceholder]);

    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const aiResponseContent = generateDummyResponse(trimmedMessage, messageFiles, selectedModel, modelSettings);

    const finalAssistantMessage: Message = {
      ...assistantPlaceholder, content: aiResponseContent,
      timestamp: new Date().toISOString(), isLoading: false, // This triggers animation
    };

    setIsStreamingResponse(true); // Start streaming state just before showing final message
    setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? finalAssistantMessage : msg));
    setIsProcessing(false); // Processing (API wait) is done, but streaming continues

  }, [newMessage, selectedFiles, messages, selectedModel, modelSettings, generateDummyResponse]); // Keep dependencies

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (uiSettings.enableKeyboardShortcuts && e.key === 'Enter' && !e.shiftKey && !isProcessing && !isStreamingResponse) { // Check both states
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentFileCount = selectedFiles.length;
    const availableSlots = MAX_FILES - currentFileCount;
    if (availableSlots <= 0) return;

    const addedFiles: FilePreview[] = [];
    let filesRejected = 0;

    Array.from(files).slice(0, availableSlots).forEach(file => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { filesRejected++; return; }
      if (!selectedModel.supportsFiles) { filesRejected++; return; }

      const fileId = generateUniqueId();
      const isImage = file.type.startsWith('image/');
      let previewUrl: string | null = null;

      if (isImage) { try { previewUrl = URL.createObjectURL(file); } catch (error) { console.error("Error creating object URL:", error); } }

      addedFiles.push({ id: fileId, name: file.name, type: file.type, size: file.size, previewUrl, fileObject: file });
    });

    if (files.length > availableSlots + filesRejected) { console.warn(`Added ${addedFiles.length} files. ${files.length - addedFiles.length} files were rejected.`); }
    else if (filesRejected > 0) { console.warn(`${filesRejected} files were rejected.`); }

    setSelectedFiles(prev => [...prev, ...addedFiles]);
    if (addedFiles.length > 0 && e.target) { e.target.value = ""; }
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl); // Clean up URL
      }
      return prev.filter(f => f.id !== fileId);
    });
    if (selectedFiles.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleStartNewChat = () => {
    // Clean up Object URLs before clearing
    messages.forEach(msg => { msg.files?.forEach(file => { if (file.previewUrl) { URL.revokeObjectURL(file.previewUrl); } }); });
    selectedFiles.forEach(file => { if (file.previewUrl) { URL.revokeObjectURL(file.previewUrl); } }); // Also clear selection URLs

    setMessages([createInitialAssistantMessage(selectedModel)]);
    setNewMessage('');
    setSelectedFiles([]);
    setChatTitle("New Chat");
    setIsProcessing(false); // Reset states
    setIsStreamingResponse(false);
    inputRef.current?.focus();
  };

  const handleCopyMessage = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 1500);
    });
  };

  const handleRegenerateResponse = useCallback(() => {
    if (isProcessing || isStreamingResponse) return; // Prevent during any activity

    let lastUserMessageIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMessageIndex = i;
        break;
      }
    }
    if (lastUserMessageIndex === -1) return;

    const lastUserMessage = messages[lastUserMessageIndex];
    const filesForRegen = lastUserMessage.files;
    const messagesToKeep = messages.slice(0, lastUserMessageIndex + 1);

    setIsProcessing(true); // Start processing state for regeneration delay
    setMessages(messagesToKeep);

    setTimeout(async () => {
      const assistantMessageId = generateUniqueId();
      const assistantPlaceholder: Message = {
        id: assistantMessageId, role: 'assistant', content: "", timestamp: new Date().toISOString(),
        modelUsed: selectedModel.name, isLoading: true,
      };
      setMessages(prev => [...prev, assistantPlaceholder]);

      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
      const aiResponseContent = generateDummyResponse(lastUserMessage.content, filesForRegen, selectedModel, modelSettings);

      const finalAssistantMessage: Message = {
        ...assistantPlaceholder, content: aiResponseContent + "\n\n_(Regenerated response)_",
        timestamp: new Date().toISOString(), isLoading: false, // Triggers animation
      };

      setIsStreamingResponse(true); // Start streaming state
      setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? finalAssistantMessage : msg));
      setIsProcessing(false); // Processing delay finished

    }, 50);
  }, [messages, selectedModel, modelSettings, generateDummyResponse, isProcessing, isStreamingResponse]); // Added state dependencies

  const handleFeedback = (messageId: string, feedback: 'good' | 'bad') => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, feedback: msg.feedback === feedback ? null : feedback } : msg
      )
    );
  };

  const handleClearHistory = useCallback(() => {
    // Clean up Object URLs
    messages.forEach(msg => { msg.files?.forEach(file => { if (file.previewUrl) { URL.revokeObjectURL(file.previewUrl); } }); });
    selectedFiles.forEach(file => { if (file.previewUrl) { URL.revokeObjectURL(file.previewUrl); } }); // Also clear selection URLs

    setMessages([createInitialAssistantMessage(selectedModel)]);
    setChatTitle("New Chat");
    setSelectedFiles([]); // Ensure selection is cleared
    setIsProcessing(false); // Reset states
    setIsStreamingResponse(false);
    setIsSettingsDialogOpen(false);
  }, [selectedModel, modelSettings.systemPrompt, messages, selectedFiles]); // Added dependencies for cleanup

  const handleExportChat = useCallback(() => {
    const chatContent = messages.map(m => {
      let fileInfo = m.files && m.files.length > 0 ? ` [Files: ${m.files.map(f => f.name).join(', ')}]` : "";
      return `[${m.role} - ${formatTimestamp(m.timestamp)}]${fileInfo}\n${m.content}`;
    }).join('\n\n---\n\n');
    const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${chatTitle.replace(/[^a-z0-9]/gi, '_')}_export_${new Date().toISOString().split('T')[0]}.txt`; // Sanitize filename
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, [messages, chatTitle]);

  const modelOptions: ModelOption[] = availableModels.map(model => ({
    id: model.id, name: model.name, description: model.description,
    capabilities: [...model.tags, ...(model.strengths?.slice(0, 1) || [])],
    isDefault: model.id === availableModels[0].id
  }));


  // --- Render ---
  const isInputDisabled = isProcessing || isStreamingResponse; // Combined input disabled state

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">

        {/* Header */}
        <header className="border-b p-3 flex items-center justify-between h-14 shrink-0 z-10 bg-background">
          <div className="flex items-center gap-2 flex-shrink min-w-0">
            <ModelIcon model={selectedModel} className="size-5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium truncate flex-shrink mr-1" title={chatTitle}>{chatTitle}</span>
            <Tooltip><TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"><Edit3 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" /></Button>
            </TooltipTrigger><TooltipContent>Rename Chat</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleStartNewChat} className="h-7 w-7 shrink-0"><Plus className="h-4 w-4" /></Button>
            </TooltipTrigger><TooltipContent>New Chat</TooltipContent></Tooltip>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ModelSelector
              availableModels={availableModels} selectedModel={selectedModel}
              onSelectModel={(model) => {
                setSelectedModel(model); setModelSettings(prev => ({ ...prev, modelId: model.id }));
                if (messages.length <= 1 && messages[0]?.role === 'assistant' && !messages[0]?.isLoading) { setMessages([createInitialAssistantMessage(model)]); }
              }}
            />
            <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
              <Tooltip><TooltipTrigger asChild><DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9"><Settings className="h-5 w-5" /></Button>
              </DialogTrigger></TooltipTrigger><TooltipContent>Settings</TooltipContent></Tooltip>
              <ChatSettingsDialog
                isOpen={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}
                modelSettings={modelSettings} setModelSettings={setModelSettings}
                uiSettings={uiSettings} setUISettings={setUISettings}
                availableModels={modelOptions}
                onClearHistory={handleClearHistory} onExportChat={handleExportChat}
                defaultModelSettings={defaultModelSettings} defaultUISettings={defaultUISettings}
              />
            </Dialog>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto px-4 pt-6 pb-10 space-y-4">
            {messages.length <= 1 && !isProcessing && !isStreamingResponse && !messages.some(m => m.role === 'user') && (
              <ChatWelcomeSuggestions onSuggestionClick={(text) => { setNewMessage(text); inputRef.current?.focus(); }} />
            )}
            {messages.map((message, index) => (
              <MessageItem
                key={message.id}
                message={message}
                selectedModel={selectedModel}
                isLastAssistantMessage={index === messages.length - 1 && message.role === 'assistant'}
                onCopy={handleCopyMessage}
                copiedMessageId={copiedMessageId}
                onRegenerate={handleRegenerateResponse}
                onFeedback={handleFeedback}
                showTimestamp={uiSettings.showTimestamps}
                isCompact={uiSettings.compactMode}
                enableMarkdown={uiSettings.enableMarkdown}
                isProcessingOrStreaming={isInputDisabled} // Combined state for Regenerate button
                onAnimationComplete={handleAnimationComplete}
              />
            ))}
            <div id="message-end-anchor" className="h-px" /> {/* Use ID for potential scroll targeting */}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <footer className="border-t pt-3 pb-2 shrink-0 bg-background/95 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 space-y-3">
            {/* File Preview Area */}
            {selectedFiles.length > 0 && (
              <ScrollArea className="max-h-40 w-full">
                <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/40 w-max">
                  {selectedFiles.map((file) =>
                    file.previewUrl && file.type.startsWith('image/') ? (
                      <ImagePreviewBadge key={file.id} file={file} onRemove={removeFile} />
                    ) : (
                      <FilePreviewBadge key={file.id} file={file} onRemove={removeFile} />
                    )
                  )}
                </div>
                <div className="h-2"></div> {/* Scrollbar padding */}
              </ScrollArea>
            )}
            {/* Input Form */}
            <div className="relative flex items-end gap-2">
              <Tooltip><TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="shrink-0 h-10 w-10 rounded-full disabled:opacity-50"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isInputDisabled || selectedFiles.length >= MAX_FILES || (!selectedModel.supportsFiles && selectedFiles.length > 0)}
                  aria-label="Attach file">
                  <Paperclip className="h-5 w-5" />
                </Button>
              </TooltipTrigger><TooltipContent>{
                !selectedModel.supportsFiles ? `${selectedModel.name} does not support files`
                  : selectedFiles.length >= MAX_FILES ? `Max ${MAX_FILES} files` : `Attach files (Max ${MAX_FILE_SIZE_MB}MB)`}
                </TooltipContent></Tooltip>
              <input type="file" ref={fileInputRef} multiple onChange={handleFileChange} className="hidden"
                accept="image/*,application/pdf,.txt,.csv,.json,.xml,.html,.css,.js,.ts,.jsx,.tsx,.py,.java,.c,.cpp,.cs,.rb,.php,.swift,.kt,.md,.docx,.xlsx,.pptx"
                disabled={isInputDisabled || !selectedModel.supportsFiles || selectedFiles.length >= MAX_FILES}
              />
              <div className="relative flex-1">
                <Textarea
                  ref={inputRef} value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isInputDisabled ? "Waiting for response..." : `Message ${selectedModel.name}...`}
                  className="min-h-[44px] max-h-[250px] pr-4 pl-3 py-2.5 resize-none overflow-y-auto rounded-xl border-border focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 shadow-sm bg-background disabled:cursor-not-allowed"
                  rows={1} disabled={isInputDisabled}
                />
              </div>
              <Button type="button" onClick={handleSendMessage}
                disabled={(!newMessage.trim() && selectedFiles.length === 0) || isInputDisabled}
                className="shrink-0 h-10 w-10 rounded-full p-0 flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                aria-label="Send message">
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
              </Button>
            </div>
            {/* Footer Info */}
            <p className="text-xs text-center text-muted-foreground px-4 pt-1">
              AI responses can be inaccurate. Verify important information. Model: {selectedModel.name} ({selectedModel.provider})
            </p>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}


// --- Prop Types for Subcomponents ---
interface ModelSelectorProps {
  availableModels: Model[];
  selectedModel: Model;
  onSelectModel: (model: Model) => void;
}

interface FilePreviewBadgeProps {
  file: FilePreview;
  onRemove: (fileId: string) => void;
}

interface ChatWelcomeSuggestionsProps {
  onSuggestionClick: (text: string) => void;
}

interface MessageItemProps {
  message: Message;
  selectedModel: Model;
  isLastAssistantMessage: boolean;
  onCopy: (content: string, messageId: string) => void;
  copiedMessageId: string | null;
  onRegenerate: () => void;
  onFeedback: (messageId: string, feedback: 'good' | 'bad') => void;
  showTimestamp: boolean;
  isCompact: boolean;
  enableMarkdown?: boolean;
  isProcessingOrStreaming: boolean; // Combined state from parent
  onAnimationComplete?: () => void;
}

// --- Sub Components ---

const ModelIcon: React.FC<{ model: Model, className?: string }> = ({ model, className }) => {
  const IconComponent = model.icon || Bot;
  return <IconComponent className={cn("h-4 w-4", className)} />;
};

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
        <Command><CommandInput placeholder="Search models..." /><CommandList><CommandEmpty>No model found.</CommandEmpty><CommandGroup heading="Available Models">
          {availableModels.map((model) => (
            <CommandItem key={model.id} value={model.name} onSelect={() => { onSelectModel(model); setIsOpen(false); }} className="cursor-pointer aria-selected:bg-accent group">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <ModelIcon model={model} className="h-5 w-5 group-aria-selected:text-foreground text-muted-foreground" />
                  <div><p className="text-sm font-medium">{model.name}</p><p className="text-xs text-muted-foreground">{model.provider}</p></div>
                </div>
                <div className="flex flex-wrap gap-1 justify-end max-w-[45%]">
                  {model.tags.slice(0, 2).map((tag) => (<Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">{tag}</Badge>))}
                </div>
              </div>
              {selectedModel.id === model.id && (<Check className="ml-auto h-4 w-4 text-primary pl-2 shrink-0" />)}
            </CommandItem>
          ))}
        </CommandGroup></CommandList></Command>
      </PopoverContent>
    </Popover>
  );
};

const MessageItem: React.FC<MessageItemProps> = React.memo(({
  message, selectedModel, isLastAssistantMessage, onCopy, copiedMessageId,
  onRegenerate, onFeedback, showTimestamp, isCompact, enableMarkdown = true,
  isProcessingOrStreaming, onAnimationComplete
}) => {
  const isUser = message.role === 'user';
  const CopyIcon = copiedMessageId === message.id ? ClipboardCheck : Clipboard;
  const modelForMessage = availableModels.find(m => m.name === message.modelUsed) || selectedModel;
  const messagePadding = isCompact ? 'px-3 py-2' : 'px-4 py-3';

  const [displayedContent, setDisplayedContent] = useState(message.content || '');
  const [isAnimating, setIsAnimating] = useState(false);
  const prevIsLoadingRef = useRef<boolean | undefined>(message.isLoading);

  useEffect(() => {
    const finishedLoading = prevIsLoadingRef.current === true && message.isLoading === false;
    if (!isUser && finishedLoading && message.content) {
      setIsAnimating(true); setDisplayedContent('');
      let charIndex = 0; const fullContent = message.content;
      const intervalId = setInterval(() => {
        setDisplayedContent((prev) => prev + fullContent[charIndex]); charIndex++;
        if (charIndex === fullContent.length) {
          clearInterval(intervalId); setIsAnimating(false); onAnimationComplete?.();
        }
      }, ANIMATION_SPEED_MS);
      return () => clearInterval(intervalId);
    }
    if (!isUser && !message.isLoading && !isAnimating && displayedContent !== message.content) { setDisplayedContent(message.content || ''); }
    prevIsLoadingRef.current = message.isLoading;
  }, [message.isLoading, message.content, message.id, isUser, onAnimationComplete]);

  const renderContent = (content: string) => {
    if (!enableMarkdown) { return content.split('\n').map((p, i) => <p key={i} className={cn(i > 0 ? "mt-2" : "", "min-h-[1em]")}>{p || '\u00A0'}</p>); }
    let html = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');
    return html.split('\n').map((p, i) => <p key={i} className={cn(i > 0 ? "mt-2" : "", "min-h-[1em]")} dangerouslySetInnerHTML={{ __html: p || ' ' }} />);
  };

  const contentToRender = isUser ? message.content : displayedContent;
  const showActionButtons = !isUser && !message.isLoading && !isAnimating;

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start', !isCompact ? 'mb-4' : 'mb-2')}>
      <div className={cn('flex gap-2.5 max-w-[85%]', isUser ? 'flex-row-reverse' : 'flex-row')}>
        {/* Avatar */}
        <Avatar className={cn('h-7 w-7 border shrink-0', isUser ? 'mt-auto mb-1' : 'mt-1')}>
          <AvatarFallback className={cn(isUser ? 'bg-primary/10' : 'bg-muted')}>
            {isUser ? <User className="h-4 w-4 text-primary" /> : <ModelIcon model={modelForMessage} className="h-4 w-4 text-foreground" />}
          </AvatarFallback>
        </Avatar>

        {/* Message Column */}
        <div className="flex flex-col w-full"> {/* Ensure this column takes full width */}
          {/* Message Bubble */}
          <div
            className={cn(
              "relative group flex flex-col rounded-xl shadow-sm min-w-[40px]",
              messagePadding,
              isUser
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                // Force assistant bubble to take full width within its parent column
                : 'bg-muted text-foreground rounded-bl-sm w-full'
            )}
          >
            {!isUser && !isCompact && (<div className="text-xs font-medium mb-1.5 text-muted-foreground">{modelForMessage.name}</div>)}

            <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed">
              {message.isLoading && !isUser ? (
                <div className="flex items-center space-x-1 py-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse animation-delay-[-0.3s]"></div><div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse animation-delay-[-0.15s]"></div><div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></div>
                </div>
              ) : (renderContent(contentToRender))}
              {!isUser && isAnimating && (<span className="inline-block w-1 h-4 bg-foreground ml-px animate-pulse"></span>)}
            </div>

            {/* Attached Files (User only) */}
            {isUser && message.files && message.files.length > 0 && (
              <div className="mt-2.5 border-t border-primary/30 pt-2.5 space-y-2">
                {message.files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 cursor-default text-sm text-primary-foreground/90">
                    {file.previewUrl && file.type.startsWith('image/') ? (
                      <img src={file.previewUrl} alt={file.name} className="h-8 w-8 rounded object-cover flex-shrink-0 border border-primary/20" loading="lazy" />
                    ) : (
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary/20 rounded">
                        {file.type.startsWith('image/') ? <ImageIcon className="h-4 w-4 text-primary-foreground/70" /> : <FileText className="h-4 w-4 text-primary-foreground/70" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-xs" title={file.name}>{file.name}</p>
                      <p className="text-xs text-primary-foreground/70">{formatFileSize(file.size)} - {file.type.split('/')[1] || 'file'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            {showActionButtons && (
              <div className="absolute -bottom-7 right-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Tooltip><TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => onCopy(message.content, message.id)}><CopyIcon className="h-3.5 w-3.5" /></Button>
                </TooltipTrigger><TooltipContent side="bottom">{copiedMessageId === message.id ? "Copied!" : "Copy"}</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn("h-6 w-6 text-muted-foreground hover:text-emerald-500", message.feedback === 'good' ? 'text-emerald-500 bg-emerald-500/10' : '')} onClick={() => onFeedback(message.id, 'good')}><ThumbsUp className="h-3.5 w-3.5" /></Button>
                </TooltipTrigger><TooltipContent side="bottom">Good</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn("h-6 w-6 text-muted-foreground hover:text-red-500", message.feedback === 'bad' ? 'text-red-500 bg-red-500/10' : '')} onClick={() => onFeedback(message.id, 'bad')}><ThumbsDown className="h-3.5 w-3.5" /></Button>
                </TooltipTrigger><TooltipContent side="bottom">Bad</TooltipContent></Tooltip>
                {isLastAssistantMessage && (
                  <Tooltip><TooltipTrigger asChild>
                    {/* Disable Regenerate if processing or streaming */}
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground disabled:opacity-50" onClick={onRegenerate} disabled={isProcessingOrStreaming}>
                      <RefreshCcw className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger><TooltipContent side="bottom">{isProcessingOrStreaming ? "Processing..." : "Regenerate"}</TooltipContent></Tooltip>
                )}
              </div>
            )}
          </div>
          {/* Timestamp */}
          {showTimestamp && (<div className={cn('text-xs text-muted-foreground mt-1', isUser ? 'text-right' : 'text-left')}>{formatTimestamp(message.timestamp)}</div>)}
        </div>
      </div>
    </div>
  );
});
MessageItem.displayName = 'MessageItem';


const FilePreviewBadge: React.FC<FilePreviewBadgeProps> = ({ file, onRemove }) => {
  return (
    <div className="relative group flex items-center gap-1.5 pl-2 pr-1 py-1 h-8 rounded-md bg-background border hover:border-border text-xs max-w-[180px] shadow-sm">
      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="truncate shrink" title={file.name}>{file.name}</span>
      <span className="text-muted-foreground/80 text-[10px] shrink-0 ml-auto mr-1">({formatFileSize(file.size)})</span>
      <Button
        variant="ghost" size="icon"
        className="absolute -top-1.5 -right-1.5 h-5 w-5 p-0 rounded-full bg-background border border-border text-muted-foreground hover:bg-muted focus:opacity-100 opacity-0 group-hover:opacity-100 z-20"
        onClick={() => onRemove(file.id)} aria-label={`Remove ${file.name}`}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

const ImagePreviewBadge: React.FC<FilePreviewBadgeProps> = ({ file, onRemove }) => {
  return (
    <div className="relative group w-20 h-20 rounded-md overflow-hidden border bg-muted shadow-sm">
      {file.previewUrl && (<img src={file.previewUrl} alt={file.name} className="object-cover w-full h-full" loading="lazy" />)}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-1 pt-2">
        <p className="text-[10px] text-white truncate leading-tight" title={file.name}>{file.name}</p>
        <p className="text-[9px] text-white/80 leading-tight">{formatFileSize(file.size)}</p>
      </div>
      {/* UPDATED Remove Button: Subtle hover, positioned above */}
      <Button
        variant="ghost" size="icon"
        className="absolute -top-1.5 -right-1.5 h-5 w-5 p-0 rounded-full bg-background border border-border text-muted-foreground hover:bg-muted focus:opacity-100 opacity-0 group-hover:opacity-100 z-20"
        onClick={() => onRemove(file.id)} aria-label={`Remove ${file.name}`}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

const ChatWelcomeSuggestions: React.FC<ChatWelcomeSuggestionsProps> = ({ onSuggestionClick }) => {
  const suggestions = ['Explain quantum computing simply', 'Python script to scrape website data', 'Ideas for a 10-day trip to Japan', 'Compare React and Vue',];
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full border bg-background p-4 mb-6 shadow-sm"><Wand2 className="h-10 w-10 text-primary" /></div>
      <h2 className="text-2xl font-semibold mb-4">How can I help you today?</h2>
      <p className="text-muted-foreground mb-6 max-w-md">Start chatting or try one of these examples:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mt-4">
        {suggestions.map((suggestion, index) => (
          <Card key={index} className="cursor-pointer hover:bg-accent  group text-left shadow-sm hover:shadow-md" onClick={() => onSuggestionClick(suggestion)}>
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

export default ModernAIChatComponent;