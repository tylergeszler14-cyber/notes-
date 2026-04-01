import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Bot, User, Trash2, ChevronDown, AlertCircle, RefreshCw } from 'lucide-react';
import Markdown from 'react-markdown';
import { Theme } from '../types';

const OLLAMA_BASE = 'http://localhost:11434';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

interface LocalAIProps {
  theme: Theme;
}

export default function LocalAI({ theme }: LocalAIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showModelPicker, setShowModelPicker] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const checkOllama = useCallback(async () => {
    setOllamaStatus('checking');
    try {
      const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(3000) });
      const data = await res.json();
      const modelList: OllamaModel[] = data.models ?? [];
      setModels(modelList);
      setOllamaStatus('online');
      if (modelList.length > 0 && !selectedModel) {
        setSelectedModel(modelList[0].name);
      }
    } catch {
      setOllamaStatus('offline');
    }
  }, [selectedModel]);

  useEffect(() => {
    checkOllama();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming || !selectedModel) return;

    const userMsg: Message = { role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setIsStreaming(true);
    setStreamingText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    abortRef.current = new AbortController();
    let accumulated = '';

    try {
      const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          model: selectedModel,
          messages: history.map(m => ({ role: m.role, content: m.content })),
          stream: true,
        }),
      });

      if (!res.ok || !res.body) throw new Error(`Ollama error: ${res.statusText}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value, { stream: true }).split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line);
            if (chunk.message?.content) {
              accumulated += chunk.message.content;
              setStreamingText(accumulated);
            }
            if (chunk.done) {
              setMessages(prev => [...prev, { role: 'assistant', content: accumulated }]);
              setStreamingText('');
              setIsStreaming(false);
            }
          } catch {
            // incomplete JSON line
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `**Error:** ${(err as Error).message}`,
        }]);
      }
      setStreamingText('');
      setIsStreaming(false);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
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

  const formatSize = (bytes: number) => {
    const gb = bytes / 1e9;
    return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / 1e6).toFixed(0)} MB`;
  };

  // Offline state
  if (ollamaStatus === 'offline') {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center" style={{ backgroundColor: theme.bg }}>
        <AlertCircle className="w-16 h-16 mb-6 opacity-50" style={{ color: theme.accent }} />
        <h2 className="text-2xl font-black mb-2" style={{ color: theme.text }}>Ollama Not Found</h2>
        <p className="text-sm mb-8 max-w-md" style={{ color: theme.textMuted }}>
          Ollama isn't running on <code className="px-1 py-0.5 rounded text-xs" style={{ backgroundColor: theme.card }}>localhost:11434</code>.
          Start it or install it to use local AI models.
        </p>
        <div className="text-left max-w-md w-full space-y-3 mb-8">
          {[
            { step: '1', label: 'Install Ollama', cmd: 'curl -fsSL https://ollama.com/install.sh | sh' },
            { step: '2', label: 'Pull a model', cmd: 'ollama pull llama3.2' },
            { step: '3', label: 'Start the server', cmd: 'ollama serve' },
          ].map(({ step, label, cmd }) => (
            <div key={step} className="p-3 rounded-lg" style={{ backgroundColor: theme.card }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: theme.textMuted }}>
                Step {step} — {label}
              </p>
              <code className="text-xs font-mono block" style={{ color: theme.accent }}>{cmd}</code>
            </div>
          ))}
        </div>
        <button
          onClick={checkOllama}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
          style={{ backgroundColor: theme.accent, color: theme.bg }}
        >
          <RefreshCw className="w-4 h-4" />
          Check Again
        </button>
      </div>
    );
  }

  // Checking state
  if (ollamaStatus === 'checking') {
    return (
      <div className="flex h-full items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.accent }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme.bg }}>
      {/* Model picker bar */}
      <div className="px-6 py-3 border-b border-white/5 flex items-center gap-3" style={{ backgroundColor: theme.sidebar }}>
        <Bot className="w-4 h-4 shrink-0" style={{ color: theme.accent }} />
        <div className="relative">
          <button
            onClick={() => setShowModelPicker(p => !p)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all hover:opacity-80"
            style={{ backgroundColor: theme.card, color: theme.text }}
          >
            {selectedModel || 'Select model'}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showModelPicker && (
            <div
              className="absolute top-full left-0 mt-1 z-20 rounded-lg shadow-xl overflow-hidden min-w-[240px]"
              style={{ backgroundColor: theme.card, border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {models.length === 0 ? (
                <div className="px-4 py-3 text-xs" style={{ color: theme.textMuted }}>
                  No models found. Run: <code className="font-mono" style={{ color: theme.accent }}>ollama pull llama3.2</code>
                </div>
              ) : (
                models.map(m => (
                  <button
                    key={m.name}
                    onClick={() => { setSelectedModel(m.name); setShowModelPicker(false); }}
                    className="w-full text-left px-4 py-3 flex items-center justify-between hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: selectedModel === m.name ? theme.accent + '22' : 'transparent',
                      color: theme.text
                    }}
                  >
                    <span className="text-sm font-bold">{m.name}</span>
                    <span className="text-xs opacity-50">{formatSize(m.size)}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-bold ml-auto" style={{ backgroundColor: '#22c55e22', color: '#22c55e' }}>
          Running locally
        </span>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="p-1.5 rounded-lg transition-all hover:opacity-70"
            title="Clear conversation"
            style={{ color: theme.textMuted }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6" onClick={() => setShowModelPicker(false)}>
        {messages.length === 0 && !isStreaming && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
            <Bot className="w-12 h-12" style={{ color: theme.textMuted }} />
            <h3 className="font-bold text-xl" style={{ color: theme.text }}>
              {selectedModel ? `${selectedModel} is ready` : 'Select a model above'}
            </h3>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.textMuted }}>
              100% local · no internet required · private
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-4 max-w-[82%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div
                className="w-8 h-8 flex items-center justify-center rounded-full shrink-0"
                style={{ backgroundColor: msg.role === 'user' ? theme.accent : theme.card, color: msg.role === 'user' ? theme.bg : theme.text }}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className="p-4 rounded-2xl shadow-md"
                style={{ backgroundColor: msg.role === 'user' ? theme.accent : theme.card, color: msg.role === 'user' ? theme.bg : theme.text }}
              >
                <div className="prose prose-sm max-w-none" style={{ color: 'inherit' }}>
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 flex items-center justify-center rounded-full shrink-0" style={{ backgroundColor: theme.card, color: theme.text }}>
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl shadow-md max-w-[82%]" style={{ backgroundColor: theme.card, color: theme.text }}>
              {streamingText ? (
                <div className="prose prose-sm max-w-none" style={{ color: 'inherit' }}>
                  <Markdown>{streamingText}</Markdown>
                </div>
              ) : (
                <div className="flex gap-1 items-center py-1">
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: theme.accent, animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: theme.accent, animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: theme.accent, animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/5" onClick={() => setShowModelPicker(false)}>
        <div className="relative flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={selectedModel ? `Message ${selectedModel}... (Enter to send)` : 'Select a model first'}
            disabled={!selectedModel || isStreaming}
            className="flex-1 p-4 bg-white/5 border border-transparent rounded-2xl focus:outline-none focus:border-white/20 text-sm transition-all resize-none overflow-hidden"
            style={{ color: theme.text, backgroundColor: theme.card }}
          />
          <div className="shrink-0 pb-1">
            {isStreaming ? (
              <button
                onClick={handleStop}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-all"
                style={{ backgroundColor: theme.card, color: theme.accent, border: `1px solid ${theme.accent}` }}
                title="Stop generating"
              >
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: theme.accent }} />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() || !selectedModel}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-all disabled:opacity-40"
                style={{ backgroundColor: theme.accent, color: theme.bg }}
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-widest opacity-40 text-center" style={{ color: theme.textMuted }}>
          Runs entirely on your device · {selectedModel || 'no model selected'}
        </p>
      </div>
    </div>
  );
}
