import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function AIAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const prompt = `You are CipherForge AI, a helpful cryptography and CTF challenge assistant. Answer the user's question clearly and concisely:

${input}`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    }

    setLoading(false);
    setInput('');
  };

  return (
    <>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight">
            <span className="text-chart-2">AI</span> Assistant
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-1">Your cryptography and CTF assistant</p>
        </div>

        {/* Chat messages */}
        <div className="space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto p-4 rounded-xl border border-border/50 bg-card/30">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-xl p-4 ${
                msg.role === 'user'
                  ? 'bg-primary/10 border border-primary/20'
                  : 'bg-background/50 border border-border/50'
              }`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown className="text-sm prose prose-sm prose-invert max-w-none font-mono">
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-sm font-mono">{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-chart-2" />
              Thinking...
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="rounded-xl border border-border/50 bg-card/30 p-4">
          <Textarea
            placeholder="Ask about cryptography, CTF challenges, or cipher decoding..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="font-mono text-sm min-h-[80px] bg-background/50 border-border/50 resize-none mb-3"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <div className="flex justify-end">
            <Button onClick={() => sendMessage()} disabled={!input.trim() || loading} className="font-mono text-xs gap-1.5">
              <Send className="w-3.5 h-3.5" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}