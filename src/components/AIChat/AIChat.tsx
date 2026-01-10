import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  chatWithGrok,
  getGrokApiKey,
  setGrokApiKey,
  suggestionPrompts,
  type ChatMessage,
  type DeckContext,
} from '@/api/grokApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  Settings,
  Trash2,
  Key,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/store';

const messageVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  deckContext?: DeckContext;
}

// Message bubble component
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted rounded-bl-md'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <span className="text-xs opacity-60 mt-1 block">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

// API Key setup dialog
function ApiKeyDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (key: string) => void;
}) {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
      setApiKey('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Configure Grok API Key
          </DialogTitle>
          <DialogDescription>
            Enter your API key to enable AI-powered deck building assistance.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="gsk_xxxx... or xai-xxxx..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>
          <div className="space-y-2 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-green-500 flex-shrink-0" />
              <p className="text-xs">
                <strong>Recommended:</strong>{' '}
                <a
                  href="https://console.groq.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Groq (console.groq.com)
                  <ExternalLink className="h-3 w-3 inline ml-1" />
                </a>
                {' '}- Free, fast, works in browser
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <p className="text-xs">
                Alternative:{' '}
                <a
                  href="https://console.x.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  xAI/Grok (console.x.ai)
                  <ExternalLink className="h-3 w-3 inline ml-1" />
                </a>
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!apiKey.trim()}>
              Save Key
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AIChat({ deckContext: propDeckContext }: AIChatProps) {
  // Get deck context from Redux if not provided via props
  const { decks, activeDeckId } = useAppSelector((state) => state.decks);
  const activeDeck = decks.find((d) => d.id === activeDeckId);
  
  // Build deck context from active deck
  const deckContext: DeckContext | undefined = propDeckContext || (activeDeck ? {
    commanderName: activeDeck.cards.find(c => c.card.type_line?.toLowerCase().includes('legendary'))?.card.name,
    format: activeDeck.format,
    cardCount: activeDeck.cards.reduce((sum, c) => sum + c.quantity, 0),
    cards: activeDeck.cards.map(c => ({
      name: c.card.name,
      quantity: c.quantity,
      type: c.card.type_line,
    })),
    colorIdentity: activeDeck.colorIdentity,
  } : undefined);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(!!getGrokApiKey());
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, streamingContent]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSaveApiKey = useCallback((key: string) => {
    setGrokApiKey(key);
    setHasApiKey(true);
    setError(null);
  }, []);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);
    setIsLoading(true);
    setStreamingContent('');

    // Build chat history for context
    const chatHistory: ChatMessage[] = messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));
    chatHistory.push({ role: 'user', content: userMessage.content });

    try {
      const response = await chatWithGrok(
        chatHistory,
        deckContext,
        (chunk) => {
          setStreamingContent((prev) => prev + chunk);
        }
      );

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      
      // If it's an API key error, prompt to add key
      if (errorMessage.includes('API key')) {
        setShowApiKeyDialog(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, deckContext]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  }, []);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 z-50"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Deck Assistant
                <span className="text-xs text-muted-foreground font-normal">powered by Grok</span>
              </SheetTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearChat}
                  title="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowApiKeyDialog(true)}
                  title="API Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {/* Welcome message */}
              {messages.length === 0 && !streamingContent && (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Welcome to Deck Assistant!</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    I can help you build and optimize your MTG decks.
                    {deckContext && (
                      <span className="block mt-1 text-primary">
                        I can see your current deck with {deckContext.cardCount} cards.
                      </span>
                    )}
                  </p>
                  
                  {/* Quick suggestions */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Try asking:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {suggestionPrompts.slice(0, 4).map((prompt) => (
                        <Button
                          key={prompt}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleSuggestionClick(prompt)}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </AnimatePresence>

              {/* Streaming response */}
              {streamingContent && (
                <motion.div
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-muted px-4 py-2">
                    <p className="text-sm whitespace-pre-wrap">{streamingContent}</p>
                    <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                  </div>
                </motion.div>
              )}

              {/* Loading indicator */}
              {isLoading && !streamingContent && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-2">
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="p-4 border-t">
            {!hasApiKey ? (
              <Button
                className="w-full"
                onClick={() => setShowApiKeyDialog(true)}
              >
                <Key className="h-4 w-4 mr-2" />
                Add API Key to Start
              </Button>
            ) : (
              <div className="flex gap-2">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about your deck..."
                  className="min-h-[44px] max-h-32 resize-none"
                  rows={1}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* API Key Dialog */}
      <ApiKeyDialog
        open={showApiKeyDialog}
        onOpenChange={setShowApiKeyDialog}
        onSave={handleSaveApiKey}
      />
    </>
  );
}
