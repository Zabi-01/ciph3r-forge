import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Send, Loader2, Bot, MessageSquare, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);

  // Load user and chat history on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        if (currentUser) {
          const history = await base44.entities.ChatHistory.filter(
            { user_email: currentUser.email },
            '-updated_at',
            20
          );
          setChatHistory(history);
          
          // Load most recent chat if exists
          if (history.length > 0) {
            setCurrentChatId(history[0].id);
            setMessages(history[0].messages || []);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveChat = async (chatId, updatedMessages) => {
    if (!user) return;
    
    try {
      const title = updatedMessages[0]?.content?.substring(0, 50) || 'New Chat';
      
      if (chatId) {
        await base44.entities.ChatHistory.update(chatId, {
          messages: updatedMessages,
          updated_at: new Date().toISOString(),
        });
      } else {
        const newChat = await base44.entities.ChatHistory.create({
          user_email: user.email,
          title,
          messages: updatedMessages,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setCurrentChatId(newChat.id);
        setChatHistory(prev => [newChat, ...prev]);
      }
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    // Check chat limit (10 min = 600 seconds per day for non-admin)
    if (user.role !== 'admin') {
      const today = new Date().toISOString().split('T')[0];
      const chatLimit = await base44.entities.UserChatLimit.filter({
        user_email: user.email,
        date: today
      });
      const currentUsage = chatLimit.length > 0 ? chatLimit[0].chat_duration_seconds : 0;
      
      if (currentUsage >= 600) {
        alert('Daily chat limit reached (10 minutes). Come back tomorrow!');
        return;
      }
    }

    const startTime = Date.now();
    const userMsg = { 
      role: 'user', 
      content: input,
      timestamp: new Date().toISOString()
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    const prompt = `You are CipherForge AI, a helpful cryptography and CTF challenge assistant. Answer the user's question clearly and concisely:

${input}`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
      });

      const assistantMsg = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };
      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);
      
      // Save to database
      await saveChat(currentChatId, finalMessages);
    } catch (error) {
      const errorMsg = {
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      setMessages([...updatedMessages, errorMsg]);
    }

    setLoading(false);

    // Track chat duration
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const today = new Date().toISOString().split('T')[0];
    
    // Update chat limit
    const chatLimit = await base44.entities.UserChatLimit.filter({
      user_email: user.email,
      date: today
    });
    
    if (chatLimit.length > 0) {
      await base44.entities.UserChatLimit.update(chatLimit[0].id, {
        chat_duration_seconds: chatLimit[0].chat_duration_seconds + duration,
        last_activity: new Date().toISOString()
      });
    } else {
      await base44.entities.UserChatLimit.create({
        user_email: user.email,
        date: today,
        chat_duration_seconds: duration,
        last_activity: new Date().toISOString()
      });
    }

    // Log activity
    await base44.entities.UserActivityLog.create({
      user_email: user.email,
      module: 'Chat',
      operation: 'Send Message',
      timestamp: new Date().toISOString(),
      details: `Message length: ${input.length} chars`
    });
  };

  const saveCurrentChat = async () => {
    if (messages.length === 0 || !user) return;

    const title = messages[0]?.content?.slice(0, 30) + (messages[0]?.content?.length > 30 ? '...' : '');
    const chatData = {
      user_email: user.email,
      title,
      messages,
      updated_at: new Date().toISOString()
    };

    try {
      if (currentChatId) {
        // Update existing chat
        await base44.entities.ChatHistory.update(currentChatId, chatData);
      } else {
        // Create new chat
        const newChat = await base44.entities.ChatHistory.create({
          ...chatData,
          created_at: new Date().toISOString()
        });
        setCurrentChatId(newChat.id);
      }
      
      // Refresh chat history
      const history = await base44.entities.ChatHistory.filter({ user_email: user.email }, '-updated_at', 50);
      setChatHistory(history);
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  const startNewChat = async () => {
    // Save current chat before starting new one
    if (messages.length > 0) {
      await saveCurrentChat();
    }
    setCurrentChatId(null);
    setMessages([]);
    setInput('');
    setShowHistory(false);
  };

  const loadChat = (chat) => {
    setCurrentChatId(chat.id);
    setMessages(chat.messages || []);
    setShowHistory(false);
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    try {
      await base44.entities.ChatHistory.delete(chatId);
      setChatHistory(prev => prev.filter(c => c.id !== chatId));
      if (currentChatId === chatId) {
        startNewChat();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 px-6 rounded-full bg-primary hover:bg-primary/90 border-2 border-primary/30 shadow-lg glow-green flex items-center gap-2 z-50 transition-all"
      >
        <Bot className="w-6 h-6 text-primary-foreground" />
        <span className="font-mono text-sm font-bold text-primary-foreground">AI Chat</span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className={cn(
              "fixed right-6 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden",
              isMinimized ? "bottom-6 w-80" : "bottom-6 w-[400px] h-[450px]"
            )}
          >

            {!isMinimized && (
              <div className="flex flex-col h-[450px]">
                {/* Header - Title with controls */}
                <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    <span className="font-mono text-sm font-bold text-foreground">CipherForge AI</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setShowHistory(!showHistory)}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={async () => {
                        await saveCurrentChat();
                        setIsMinimized(!isMinimized);
                      }}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={async () => {
                        await saveCurrentChat();
                        setIsOpen(false);
                      }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* History Panel */}
                <AnimatePresence>
                  {showHistory && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-b border-border/50 overflow-hidden flex-shrink-0"
                    >
                      <div className="p-3 bg-background/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs text-muted-foreground">Chat History</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={startNewChat}
                          >
                            New Chat
                          </Button>
                        </div>
                        <div className="space-y-1 max-h-[200px] overflow-y-auto">
                          {chatHistory.map(chat => (
                            <div
                              key={chat.id}
                              className={cn(
                                "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
                                currentChatId === chat.id
                                  ? "bg-primary/10 border border-primary/30"
                                  : "hover:bg-secondary"
                              )}
                              onClick={() => loadChat(chat)}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-mono text-xs truncate">{chat.title || 'New Chat'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(chat.updated_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => deleteChat(chat.id, e)}
                              >
                                <Trash2 className="w-3 h-3 text-muted-foreground" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Messages - Scrollable area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <Bot className="w-12 h-12 text-primary/30 mx-auto mb-3" />
                      <p className="font-mono text-sm text-muted-foreground">
                        Start a conversation about cryptography or CTF challenges
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] rounded-xl p-3 ${
                          msg.role === 'user'
                            ? 'bg-primary/10 border border-primary/20'
                            : 'bg-background/50 border border-border/50'
                        }`}>
                          {msg.role === 'assistant' ? (
                            <ReactMarkdown className="text-xs prose prose-sm prose-invert max-w-none font-mono">
                              {msg.content}
                            </ReactMarkdown>
                          ) : (
                            <p className="text-xs font-mono">{msg.content}</p>
                          )}
                          {msg.timestamp && (
                            <p className="text-[10px] text-muted-foreground mt-1 text-right">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                  {loading && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="flex items-center gap-2 text-xs font-mono text-muted-foreground"
                    >
                      <Loader2 className="w-3 h-3 animate-spin text-chart-2" />
                      Thinking...
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input - Fixed at bottom */}
                <div className="border-t border-border/50 bg-background/30 flex-shrink-0">
                  <div className="p-4">
                    <div className="flex gap-2 items-end">
                      <Textarea
                        placeholder="Ask about cryptography, CTF challenges, or cipher decoding..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="font-mono text-xs min-h-[40px] max-h-[100px] bg-background/50 border-border/50 resize-y flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <Button 
                        onClick={() => sendMessage()} 
                        disabled={!input.trim() || loading} 
                        className="font-mono text-xs gap-1.5 h-10 flex-shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}