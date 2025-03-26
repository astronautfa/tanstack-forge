import { createFileRoute } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  RefreshCw,
  Settings,
  Copy,
  User,
  Paperclip,
  X,
  Zap,
  MoreHorizontal,
  Terminal,
  Clock,
  ArrowUpRight,
  MessageSquare,
  ChevronDown,
  Plus,
  Trash2,
  Download,
  ClipboardCopy,
  Info,
  CheckSquare,
  Share2,
  Bot,
  SunMedium,
  Moon,
  Palette,
} from 'lucide-react';

import { Button } from "@app/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@app/ui/components/select";
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
import { Separator } from "@app/ui/components/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@app/ui/components/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@app/ui/components/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@app/ui/components/popover";
import { Switch } from "@app/ui/components/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@app/ui/components/tabs";
import { Label } from "@app/ui/components/label";
import { Checkbox } from "@app/ui/components/checkbox";
import { Alert, AlertDescription } from "@app/ui/components/alert";
import { Command } from '@app/ui/components/command';

// Type definitions
interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  files?: string[];
}

interface Conversation {
  id: number;
  title: string;
  date?: string;
  model?: string;
}

interface Model {
  id: string;
  name: string;
  provider: string;
  tags: string[];
  icon: string;
}

export const Route = createFileRoute('/(app)/tools')({
  component: ModernAIChatComponent,
});

// Mock data for conversation history
const mockConversations: Conversation[] = [
  { id: 1, title: "Project planning assistance", date: "2 hours ago", model: "Claude 3.5 Sonnet" },
  { id: 2, title: "Code review for React components", date: "Yesterday", model: "GPT-4o" },
  { id: 3, title: "Marketing copy ideas", date: "3 days ago", model: "Claude 3.5 Haiku" },
  { id: 4, title: "Data analysis workflow", date: "Last week", model: "Llama 3" },
  { id: 5, title: "UI/UX design feedback", date: "Last week", model: "Claude 3 Opus" },
];

// Sample models with capabilities
const availableModels: Model[] = [
  { id: "claude-35-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", tags: ["Reasoning", "Vision"], icon: "sparkles" },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", tags: ["Multimodal", "Latest"], icon: "zap" },
  { id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic", tags: ["Most Capable"], icon: "sparkles" },
  { id: "llama-3", name: "Llama 3", provider: "Meta", tags: ["Open Source"], icon: "terminal" },
  { id: "claude-35-haiku", name: "Claude 3.5 Haiku", provider: "Anthropic", tags: ["Fast"], icon: "sparkles" },
];

function ModernAIChatComponent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: "Hi, I'm your AI assistant. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model>(availableModels[0]);
  const [currentConversation, setCurrentConversation] = useState<Conversation>({ id: 0, title: "New Chat" });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<string>("system");

  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const handleSubmit = () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    if (currentConversation.id === 0 && messages.length === 1) {
      setCurrentConversation({
        id: Date.now(),
        title: newMessage.length > 30 ? newMessage.substring(0, 30) + "..." : newMessage,
      });
    }

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: newMessage,
      timestamp: new Date().toISOString(),
      files: selectedFiles.length > 0 ? selectedFiles.map((file) => file.name) : undefined,
    };

    setMessages([...messages, userMessage]);
    setNewMessage('');
    setSelectedFiles([]);
    setIsProcessing(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: generateDummyResponse(userMessage.content, userMessage.files),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 1500);
  };

  const generateDummyResponse = (input: string, files?: string[]): string => {
    const baseResponses = [
      "I've analyzed your request and here's what I found. The key points to consider are:\n\n1. The approach you're considering has both advantages and trade-offs\n2. There are several alternative methods that might work better in your specific context\n3. Based on best practices, I'd recommend starting with a simpler implementation",

      "Thanks for your question. Let me provide a comprehensive answer:\n\nThe fundamental concept here involves understanding how different components interact within the system. When we look at this from a holistic perspective, we can see that the optimal solution requires balancing several competing factors.",

      "I've thought about your query carefully. Here's my analysis:\n\nThis is a nuanced topic with several dimensions to consider. The primary considerations include technical feasibility, implementation complexity, and long-term maintainability. Let me break this down further to help clarify the best approach for your specific needs.",
    ];

    const fileResponse = files
      ? `\n\nI've also reviewed the files you shared (${files.join(', ')}). The contents align with your question and provide helpful context for my response.`
      : '';

    return `${baseResponses[Math.floor(Math.random() * baseResponses.length)]}${fileResponse}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray: File[] = Array.from(files);
      setSelectedFiles((prev: File[]) => [...prev, ...fileArray]);
    }
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const startNewChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: "Hi, I'm your AI assistant. How can I help you today?",
        timestamp: new Date().toISOString(),
      },
    ]);
    setCurrentConversation({ id: 0, title: "New Chat" });
    setNewMessage('');
    setSelectedFiles([]);
  };

  const suggestions = [
    'Explain the differences between various JavaScript frameworks',
    'Help me debug this React component',
    'Generate test cases for my API',
    'Suggest ways to improve my apps performance',
  ];

  const getModelIcon = (iconName: string) => {
    switch (iconName) {
      case 'sparkles':
        return <Sparkles className="h-4 w-4" />;
      case 'zap':
        return <Zap className="h-4 w-4" />;
      case 'terminal':
        return <Terminal className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  // Rest of the component remains the same, just with proper typing
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 flex flex-col overflow-hidden`}>
        {isSidebarOpen && (
          <>
            <div className="p-2">
              <Button
                onClick={startNewChat}
                className="w-full gap-2"
                size="lg"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2 pb-4">
                <div className="flex items-center justify-between py-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">Recent Conversations</h3>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {mockConversations.map((chat) => (
                  <Card
                    key={chat.id}
                    className={`cursor-pointer hover:bg-accent transition-colors p-3 space-y-1 ${currentConversation.id === chat.id ? 'bg-accent/50' : ''}`}
                    onClick={() => setCurrentConversation(chat)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium truncate">{chat.title}</h4>
                        <p className="text-xs text-muted-foreground">{chat.date}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <ClipboardCopy className="mr-2 h-4 w-4" />
                            Copy chat link
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Export chat
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete chat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline" className="text-xs">
                        {chat.model}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>


            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                  <DialogDescription>
                    Customize your chat experience and preferences
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="general">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="models">Models</TabsTrigger>
                    <TabsTrigger value="privacy">Privacy</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Theme</Label>
                          <p className="text-sm text-muted-foreground">Choose your preferred visual theme</p>
                        </div>
                        <Select value={theme} onValueChange={setTheme}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="system">
                              <div className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                System
                              </div>
                            </SelectItem>
                            <SelectItem value="light">
                              <div className="flex items-center gap-2">
                                <SunMedium className="h-4 w-4" />
                                Light
                              </div>
                            </SelectItem>
                            <SelectItem value="dark">
                              <div className="flex items-center gap-2">
                                <Moon className="h-4 w-4" />
                                Dark
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Message Timestamps</Label>
                          <p className="text-sm text-muted-foreground">Show timestamps on messages</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-scroll</Label>
                          <p className="text-sm text-muted-foreground">Automatically scroll to latest messages</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="models" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Default Model</Label>
                        <p className="text-sm text-muted-foreground">Select your preferred model for new chats</p>
                      </div>

                      {availableModels.map((model) => (
                        <div key={model.id} className="flex items-center space-x-2">
                          <Checkbox id={model.id} defaultChecked={model.id === selectedModel.id} />
                          <Label htmlFor={model.id} className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getModelIcon(model.icon)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span>{model.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">{model.provider}</span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="privacy" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Conversation History</Label>
                          <p className="text-sm text-muted-foreground">Store conversation history</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Usage Analytics</Label>
                          <p className="text-sm text-muted-foreground">Share anonymous usage data</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <Button variant="outline" className="w-full">
                        Clear All Conversation History
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
                  <Button onClick={() => setIsSettingsOpen(false)}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mr-2"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-lg font-medium">{currentConversation.title}</h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {selectedModel.name}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {currentConversation.id !== 0 ?
                    `Started ${currentConversation.date || 'just now'}` :
                    'New conversation'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <span className="hidden sm:inline-block">Model:</span> {selectedModel.name}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0" align="end">
                <Command>
                  <div className="p-2">
                    <h3 className="text-sm font-medium">Select Model</h3>
                    <p className="text-xs text-muted-foreground">Choose which AI model to use</p>
                  </div>
                  <Separator />
                  <div className="p-2 space-y-1">
                    {availableModels.map((model) => (
                      <div
                        key={model.id}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${selectedModel.id === model.id ? 'bg-accent' : 'hover:bg-accent/50'}`}
                        onClick={() => setSelectedModel(model)}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getModelIcon(model.icon)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{model.name}</p>
                            <p className="text-xs text-muted-foreground">{model.provider}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {model.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Command>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={startNewChat}>
                    <Plus className="mr-2 h-4 w-4" />
                    New chat
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share conversation
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Export conversation
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`${message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                    } rounded-lg p-4 max-w-[80%] shadow-sm relative group`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className={`${message.role === 'user' ? 'bg-primary-foreground/20' : 'bg-background'}`}>
                        {message.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          getModelIcon(selectedModel.icon)
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">
                      {message.role === 'user' ? 'You' : selectedModel.name}
                    </span>
                    <span className="text-xs opacity-70">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>

                  <div className="prose prose-sm dark:prose-invert">
                    {message.content.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-2 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {message.files && message.files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.files.map((file) => (
                        <Badge key={file} variant="secondary">
                          <Paperclip className="h-3 w-3 mr-1" />
                          {file}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => navigator.clipboard.writeText(message.content)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy message</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-4 max-w-[80%] shadow-sm">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-background">
                        {getModelIcon(selectedModel.icon)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{selectedModel.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-75"></div>
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            )}

            {messages.length === 1 && !isProcessing && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">How can I help you today?</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Ask me anything - from answering questions and generating content to helping with code and brainstorming ideas.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                  {suggestions.map((suggestion, index) => (
                    <Card
                      key={index}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => {
                        setNewMessage(suggestion);
                        inputRef.current?.focus();
                      }}
                    >
                      <CardContent className="p-4 flex items-start gap-3">
                        <ArrowUpRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm">{suggestion}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <footer className="border-t p-4">
          <div className="max-w-3xl mx-auto space-y-3">
            <Alert variant="default" className="py-2">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Model: <span className="font-medium">{selectedModel.name}</span>.
                Responses may not always be accurate. Double-check important information.
              </AlertDescription>
            </Alert>

            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file) => (
                  <Badge key={file.name} variant="secondary" className="flex items-center gap-1 py-1">
                    <Paperclip className="h-3 w-3" />
                    {file.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeFile(file.name)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <div className="relative flex-1">
                <Textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message..."
                  className="min-h-[60px] pr-12 resize-none overflow-hidden border-primary/20 focus-visible:ring-primary/30"
                  rows={1}
                  style={{ height: `${Math.min(200, Math.max(60, newMessage.split('\n').length * 24))}px` }}
                />
                <div className="absolute bottom-2 right-2 flex">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Attach files</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={(!newMessage.trim() && selectedFiles.length === 0) || isProcessing}
                className="rounded-full h-[50px] w-[50px] p-0 flex items-center justify-center"
              >
                {isProcessing ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </form>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-3 w-3" />
                <span>Input processed securely</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>{selectedModel.provider}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ModernAIChatComponent;