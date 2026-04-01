import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Bot, Trash2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { Theme } from '../types';
import { streamChat, Message } from '../services/claude';

interface AIAssistantProps {
  theme: Theme;
}

export default function AIAssistant({ theme }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMessage: Message = { role: 'user', content: text };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setIsStreaming(true);
    setStreamingText('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    let accumulated = '';

    await streamChat(
      nextMessages,
      (chunk) => {
        accumulated += chunk;
        setStreamingText(accumulated);
      },
      () => {
        setMessages(prev => [...prev, { role: 'assistant', content: accumulated }]);
        setStreamingText('');
        setIsStreaming(false);
      },
      (errMsg) => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Error: ${errMsg}`
        }]);
        setStreamingText('');
        setIsStreaming(false);
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme.bg }}>
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && !isStreaming && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <Bot className="w-12 h-12" style={{ color: theme.textMuted }} />
            <div className="space-y-1">
              <h3 className="font-bold text-xl" style={{ color: theme.text }}>Ask me anything</h3>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.textMuted }}>
                Powered by Claude Opus 4.6
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div
                className="w-8 h-8 flex items-center justify-center rounded-full shrink-0"
                style={{
                  backgroundColor: msg.role === 'user' ? theme.accent : theme.card,
                  color: msg.role === 'user' ? theme.bg : theme.text
                }}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className="p-4 rounded-2xl shadow-lg"
                style={{
                  backgroundColor: msg.role === 'user' ? theme.accent : theme.card,
                  color: msg.role === 'user' ? theme.bg : theme.text
                }}
              >
                <div className="prose prose-sm max-w-none" style={{ color: 'inherit' }}>
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {isStreaming && (
          <div className="flex gap-4 justify-start">
            <div
              className="w-8 h-8 flex items-center justify-center rounded-full shrink-0"
              style={{ backgroundColor: theme.card, color: theme.text }}
            >
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl shadow-lg max-w-[80%]" style={{ backgroundColor: theme.card, color: theme.text }}>
              {streamingText ? (
                <div className="prose prose-sm max-w-none" style={{ color: 'inherit' }}>
                  <Markdown>{streamingText}</Markdown>
                </div>
              ) : (
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: theme.accent }} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/5">
        <div className="relative flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... (Enter to send, Shift+Enter for newline)"
            disabled={isStreaming}
            className="flex-1 p-4 pr-4 bg-white/5 border border-transparent rounded-2xl focus:outline-none focus:border-white/20 text-sm transition-all resize-none overflow-hidden"
            style={{ color: theme.text, backgroundColor: theme.card }}
          />
          <div className="flex gap-2 shrink-0 pb-1">
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                disabled={isStreaming}
                title="Clear conversation"
                className="w-10 h-10 flex items-center justify-center rounded-full transition-all disabled:opacity-50 hover:bg-white/10"
                style={{ color: theme.textMuted }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="w-10 h-10 flex items-center justify-center rounded-full transition-all disabled:opacity-50"
              style={{ backgroundColor: theme.accent, color: theme.bg }}
            >
              {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-widest opacity-50 text-center" style={{ color: theme.textMuted }}>
          Claude can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
