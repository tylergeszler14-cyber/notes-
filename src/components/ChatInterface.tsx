import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Bot, Quote } from 'lucide-react';
import Markdown from 'react-markdown';
import { Source, ChatMessage, Theme } from '../types';
import * as gemini from '../services/gemini';

interface ChatInterfaceProps {
  sources: Source[];
  theme: Theme;
}

export default function ChatInterface({ sources, theme }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      text: input,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await gemini.askQuestion(input, sources, messages);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: 'error',
        role: 'model',
        text: "Sorry, I encountered an error while processing your request."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme.bg }}>
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <Bot className="w-12 h-12" style={{ color: theme.textMuted }} />
            <div className="space-y-1">
              <h3 className="font-bold text-xl" style={{ color: theme.text }}>Ask anything about your sources</h3>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.textMuted }}>I'll only answer using the data you provided.</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div 
                className="w-8 h-8 flex items-center justify-center rounded-full shrink-0"
                style={{ backgroundColor: msg.role === 'user' ? theme.accent : theme.card, color: msg.role === 'user' ? theme.bg : theme.text }}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`space-y-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div 
                  className="p-4 rounded-2xl shadow-lg"
                  style={{ backgroundColor: msg.role === 'user' ? theme.accent : theme.card, color: msg.role === 'user' ? theme.bg : theme.text }}
                >
                  <div className="markdown-body prose prose-sm max-w-none" style={{ color: 'inherit' }}>
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </div>
                
                {msg.citations && msg.citations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {msg.citations.map((cite, i) => (
                      <div 
                        key={i} 
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase"
                        style={{ backgroundColor: theme.card, color: theme.textMuted }}
                      >
                        <Quote className="w-3 h-3" />
                        {cite.sourceName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 animate-pulse">
              <Bot className="w-4 h-4" style={{ color: theme.textMuted }} />
            </div>
            <div className="p-4 rounded-2xl bg-white/5 shadow-lg">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: theme.accent }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/5">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={sources.length > 0 ? "Ask a question..." : "Add sources to start chatting"}
            disabled={sources.length === 0 || isLoading}
            className="w-full p-4 pr-16 bg-white/5 border border-transparent rounded-full focus:outline-none focus:border-white/20 text-sm transition-all"
            style={{ color: theme.text, backgroundColor: theme.card }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || sources.length === 0}
            className="absolute right-2 w-10 h-10 flex items-center justify-center rounded-full transition-all disabled:opacity-50"
            style={{ backgroundColor: theme.accent, color: theme.bg }}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest opacity-50 text-center" style={{ color: theme.textMuted }}>
          NotebookAI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
