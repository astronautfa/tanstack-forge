import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import {
  Send,
  Sparkles,
  RefreshCw,
  ChevronDown,
  Settings,
  Copy,
  User,
  SquareCode,
  ImageIcon,
  Film,
  AudioWaveform,
  PanelLeft,
  Paperclip
} from 'lucide-react'

export const Route = createFileRoute('/(app)/tools')({
  component: ToolsComponent,
})

function ToolsComponent() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'system',
      content: 'I\'m an AI assistant designed to help you with various tasks. How can I help you today?'
    },
    {
      id: 2,
      role: 'user',
      content: 'Can you explain how transformer models work in AI?'
    },
    {
      id: 3,
      role: 'assistant',
      content: 'Transformer models are a type of neural network architecture that revolutionized natural language processing and many other AI fields. Here\'s how they work:\n\n1. **Self-attention mechanism**: This is the core innovation. Transformers can "pay attention" to different parts of the input sequence when processing each element, allowing them to understand context better than previous sequential models.\n\n2. **Parallel processing**: Unlike RNNs or LSTMs that process tokens sequentially, transformers process all tokens simultaneously, making them much more efficient to train.\n\n3. **Positional encoding**: Since transformers process all tokens at once, they need a way to understand the order of words. Positional encodings add information about token position in the sequence.\n\n4. **Encoder-decoder structure**: The original transformer had an encoder (to understand the input) and a decoder (to generate the output), though many modern models use only one of these components.\n\nTransformers power models like GPT (decoder-only), BERT (encoder-only), and T5 (encoder-decoder). Their ability to handle long-range dependencies and parallel processing has made them the foundation for most cutting-edge AI systems today.'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);


  const handleSendMessage = (e: any) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: newMessage
    };
    setMessages([...messages, userMessage]);
    setNewMessage('');
    setIsProcessing(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        role: 'assistant',
        content: generateDummyResponse()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 1500);
  };

  // Generate a dummy response based on the input (this is just for demo purposes)
  const generateDummyResponse = () => {
    const responses = [
      "That's an interesting question. Based on my knowledge, I would approach this by analyzing the key factors involved. First, we need to consider the context and underlying principles. Then, we can explore different perspectives and potential solutions.",

      "I'd be happy to help with that. This is a complex topic that involves several important considerations. Let me break it down step by step so we can better understand the nuances and implications.",

      "Great question! This is an area that has seen significant development recently. The current understanding involves multiple dimensions, from theoretical frameworks to practical applications. Let me explain how these elements connect.",

      "I understand your query. To provide a comprehensive answer, I'll need to draw from various domains of knowledge. The intersection of these domains reveals patterns and insights that might not be apparent when looking at each area in isolation."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
        <div className="flex items-center gap-2">
          <button className="rounded-full p-2 hover:bg-muted">
            <PanelLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="rounded-full p-2 hover:bg-muted">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Model selector */}
      <div className="mb-4">
        <div className="flex items-center justify-center">
          <div className="relative inline-block">
            <button className="flex items-center gap-2 rounded-full bg-background border px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted">
              <Sparkles className="h-4 w-4 text-primary" />
              GPT-4 Ultra
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Message container */}
      <div className="flex-1 overflow-y-auto rounded-lg border bg-card shadow-sm mb-4 p-4">
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl ${message.role === 'system' ? 'bg-muted/50 border-l-4 border-primary' : message.role === 'user' ? 'bg-primary/10' : 'bg-card border'} rounded-lg p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  {message.role === 'user' ? (
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/30 p-1 rounded-full">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">You</span>
                    </div>
                  ) : message.role === 'system' ? (
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/30 p-1 rounded-full">
                        <Settings className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">System</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/30 p-1 rounded-full">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">AI Assistant</span>
                    </div>
                  )}

                  {message.role !== 'system' && (
                    <div className="ml-auto flex items-center gap-1">
                      <button className="rounded-full p-1 hover:bg-muted">
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {message.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="my-2">
                      {paragraph.split('\n').map((line, lineIdx) => (
                        <span key={lineIdx}>
                          {line}
                          {lineIdx < paragraph.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="max-w-3xl bg-card border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-primary/30 p-1 rounded-full">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">AI Assistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-ping"></div>
                  <div className="h-2 w-2 rounded-full bg-primary animate-ping delay-150"></div>
                  <div className="h-2 w-2 rounded-full bg-primary animate-ping delay-300"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messageEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="relative">
        <form onSubmit={handleSendMessage} className="flex flex-col">
          <div className="flex items-center rounded-lg border bg-background shadow-sm">
            <button
              type="button"
              className="p-3 text-muted-foreground hover:text-foreground"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message AI Assistant..."
              className="min-h-[60px] flex-1 resize-none bg-transparent px-3 py-3 outline-none"
              rows={1}
            />

            <div className="flex items-center px-3">
              <button
                type="submit"
                disabled={!newMessage.trim() || isProcessing}
                className={`rounded-md p-2 ${!newMessage.trim() || isProcessing ? 'text-muted-foreground' : 'bg-primary text-primary-foreground'}`}
              >
                {isProcessing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            AI responses are generated and may contain inaccuracies or creative elements. Verify important information.
          </p>
        </form>
      </div>

      {/* Quick action buttons */}
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">Try asking</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "Write a case study for a SaaS marketing campaign",
            "Generate an algorithm to sort a list efficiently",
            "Explain quantum computing in simple terms",
            "Create a weekly content plan for social media"
          ].map((suggestion, index) => (
            <button
              key={index}
              className="rounded-full border bg-background px-3 py-1.5 text-xs hover:bg-muted"
              onClick={() => {
                setNewMessage(suggestion);
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Capability cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm hover:bg-muted/50 cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <SquareCode className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Code Generation</span>
          </div>
          <p className="text-sm text-muted-foreground">Generate and explain code in various programming languages</p>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm hover:bg-muted/50 cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon className="h-5 w-5 text-purple-500" />
            <span className="font-medium">Image Generation</span>
          </div>
          <p className="text-sm text-muted-foreground">Create images from text descriptions</p>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm hover:bg-muted/50 cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <AudioWaveform className="h-5 w-5 text-green-500" />
            <span className="font-medium">Voice Synthesis</span>
          </div>
          <p className="text-sm text-muted-foreground">Convert text to natural-sounding speech</p>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm hover:bg-muted/50 cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <Film className="h-5 w-5 text-red-500" />
            <span className="font-medium">Video Generation</span>
          </div>
          <p className="text-sm text-muted-foreground">Create short videos from text descriptions</p>
        </div>
      </div>
    </div>
  )
}