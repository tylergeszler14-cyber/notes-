/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  FileText, 
  Link as LinkIcon, 
  Youtube, 
  BookOpen, 
  MessageSquare, 
  Mic, 
  Network, 
  Trash2, 
  ChevronRight,
  Loader2,
  Play,
  Pause,
  Download,
  X,
  Settings as SettingsIcon,
  Home,
  Search,
  Library,
  Info,
  Menu,
  Smartphone,
  Share,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Source, SourceType, ChatMessage, NotebookGuide, Theme, THEMES } from './types';
import * as gemini from './services/gemini';
import SourceManager from './components/SourceManager';
import ChatInterface from './components/ChatInterface';
import NotebookGuideView from './components/NotebookGuideView';
import AudioOverview from './components/AudioOverview';
import MindMap from './components/MindMap';
import AIAssistant from './components/AIAssistant';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [sources, setSources] = useState<Source[]>(() => {
    const saved = localStorage.getItem('notebook_sources');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState<'chat' | 'guide' | 'mindmap' | 'audio' | 'assistant'>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [guide, setGuide] = useState<NotebookGuide | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('notebook_theme');
    if (saved) {
      const parsed = JSON.parse(saved);
      return THEMES.find(t => t.id === parsed.id) || THEMES[0];
    }
    return THEMES[0];
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const SHARED_APP_URL = 'https://ais-pre-uvpitnwsafakhelgub7j7e-327479393967.us-east1.run.app';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(SHARED_APP_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Persist sources to local storage
  useEffect(() => {
    localStorage.setItem('notebook_sources', JSON.stringify(sources));
  }, [sources]);

  // Persist theme to local storage
  useEffect(() => {
    localStorage.setItem('notebook_theme', JSON.stringify(theme));
  }, [theme]);

  // Apply theme colors to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-bg', theme.bg);
    root.style.setProperty('--theme-sidebar', theme.sidebar);
    root.style.setProperty('--theme-card', theme.card);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-text', theme.text);
    root.style.setProperty('--theme-text-muted', theme.textMuted);
  }, [theme]);

  const handleAddSource = async (source: Source) => {
    setIsLoading(true);
    try {
      const { summary, keywords } = await gemini.generateSummary(source);
      const newSource = { ...source, summary, keywords };
      setSources(prev => [...prev, newSource]);
    } catch (error) {
      console.error("Error adding source:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const generateGuide = async () => {
    if (sources.length === 0) return;
    setIsLoading(true);
    try {
      const newGuide = await gemini.generateNotebookGuide(sources);
      setGuide(newGuide);
      setActiveTab('guide');
    } catch (error) {
      console.error("Error generating guide:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-black font-sans overflow-hidden p-0 md:p-2 gap-0 md:gap-2 relative">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10"
        style={{ color: theme.text }}
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={cn(
        "fixed inset-0 z-40 md:relative md:inset-auto md:flex w-72 flex-col gap-2 shrink-0 transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col h-full p-2 md:p-0 gap-2 bg-black md:bg-transparent">
          {/* Navigation Box */}
          <div className="bg-[#121212] rounded-lg p-4 space-y-4" style={{ backgroundColor: theme.sidebar }}>
            <div className="flex items-center gap-4 px-2 py-2 text-white font-bold cursor-pointer hover:text-white/80 transition-colors" onClick={() => { setActiveTab('chat'); setIsSidebarOpen(false); }}>
              <Home className="w-6 h-6" style={{ color: activeTab === 'chat' ? theme.accent : 'inherit' }} />
              <span style={{ color: activeTab === 'chat' ? theme.accent : theme.text }}>Home</span>
            </div>
            <div className="flex items-center gap-4 px-2 py-2 text-white/70 font-bold cursor-pointer hover:text-white transition-colors" onClick={() => { setIsSettingsOpen(true); setIsSidebarOpen(false); }}>
              <SettingsIcon className="w-6 h-6" style={{ color: theme.textMuted }} />
              <span style={{ color: theme.textMuted }}>Settings</span>
            </div>
          </div>

          {/* Library Box */}
          <div className="flex-1 bg-[#121212] rounded-lg flex flex-col overflow-hidden" style={{ backgroundColor: theme.sidebar }}>
            <div className="p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2 text-white/70 font-bold">
                <Library className="w-6 h-6" style={{ color: theme.textMuted }} />
                <span style={{ color: theme.textMuted }}>Your Sources</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <SourceManager 
                onAddSource={handleAddSource} 
                sources={sources} 
                onDeleteSource={handleDeleteSource}
                theme={theme}
              />
            </div>

            {sources.length > 0 && (
              <div className="p-4 border-t border-white/5">
                <button
                  onClick={() => { generateGuide(); setIsSidebarOpen(false); }}
                  disabled={isLoading}
                  className="w-full py-2 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50"
                  style={{ backgroundColor: theme.accent, color: theme.bg }}
                >
                  {isLoading ? 'Generating...' : 'Generate Guide'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#121212] md:rounded-lg flex flex-col overflow-hidden relative" style={{ backgroundColor: theme.bg }}>
        {/* Header with Banner */}
        <div className="relative h-48 md:h-64 shrink-0 overflow-hidden">
          <img 
            src={theme.banner || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop'} 
            alt="Banner" 
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent" style={{ backgroundImage: `linear-gradient(to top, ${theme.bg}, transparent)` }} />
          
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-8 space-y-2">
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest" style={{ color: theme.text }}>
              <Info className="w-3 h-3 md:w-4 md:h-4" />
              Research Workspace
            </div>
            <h1 className="text-3xl md:text-6xl font-black tracking-tighter" style={{ color: theme.text }}>
              {activeTab === 'chat' ? 'Notebook Chat' :
               activeTab === 'guide' ? 'Notebook Guide' :
               activeTab === 'mindmap' ? 'Knowledge Map' :
               activeTab === 'audio' ? 'Audio Overview' : 'Claude AI'}
            </h1>
          </div>

          {/* Tab Navigation (Spotify style pills) */}
          <div className="absolute top-4 left-4 md:left-8 flex gap-2">
            {[
              { id: 'chat', label: 'Chat' },
              { id: 'guide', label: 'Guide' },
              { id: 'mindmap', label: 'Map' },
              { id: 'audio', label: 'Audio' },
              { id: 'assistant', label: 'Claude AI' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-bold transition-all",
                  activeTab === tab.id 
                    ? "bg-white text-black" 
                    : "bg-black/20 text-white hover:bg-black/40"
                )}
                style={activeTab === tab.id ? { backgroundColor: theme.accent, color: theme.bg } : { color: theme.text }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full"
            >
              {activeTab === 'chat' && <ChatInterface sources={sources} theme={theme} />}
              {activeTab === 'guide' && <NotebookGuideView guide={guide} isLoading={isLoading} theme={theme} />}
              {activeTab === 'mindmap' && <MindMap sources={sources} theme={theme} />}
              {activeTab === 'audio' && <AudioOverview sources={sources} theme={theme} />}
              {activeTab === 'assistant' && <AIAssistant theme={theme} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#282828] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl border border-white/10"
              style={{ backgroundColor: theme.card }}
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-2xl font-bold" style={{ color: theme.text }}>Themes & Customization</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" style={{ color: theme.text }} />
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-6">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t)}
                      className={cn(
                        "group relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                        theme.id === t.id ? "border-white" : "border-transparent hover:border-white/50"
                      )}
                    >
                      <img 
                        src={t.banner} 
                        alt={t.name} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-3 left-3 text-left">
                        <p className="font-bold text-white">{t.name}</p>
                        <div className="flex gap-1 mt-1">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.accent }} />
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.bg }} />
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.sidebar }} />
                        </div>
                      </div>
                      {theme.id === t.id && (
                        <div className="absolute top-3 right-3 bg-white text-black rounded-full p-1">
                          <Play className="w-3 h-3 fill-current" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold" style={{ color: theme.text }}>Custom CSS</h3>
                  <textarea 
                    placeholder="/* Add your custom CSS here... */"
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-white/30"
                    style={{ color: theme.text }}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: theme.text }}>
                    <Smartphone className="w-5 h-5" />
                    Install on Mobile
                  </h3>
                  
                  <div className="bg-black/40 p-4 rounded-lg border border-white/10 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-50" style={{ color: theme.text }}>App URL</p>
                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded border border-white/5 overflow-hidden">
                      <code className="text-[10px] md:text-xs truncate flex-1" style={{ color: theme.text }}>{SHARED_APP_URL}</code>
                      <button 
                        onClick={handleCopyUrl}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors shrink-0"
                        title="Copy URL"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" style={{ color: theme.textMuted }} />}
                      </button>
                    </div>
                    <p className="text-[10px]" style={{ color: theme.textMuted }}>
                      Copy this URL and open it in your mobile browser to begin installation.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-2">
                      <p className="font-bold text-sm" style={{ color: theme.text }}>iOS (iPhone/iPad)</p>
                      <ol className="text-xs space-y-2 list-decimal list-inside" style={{ color: theme.textMuted }}>
                        <li>Open this app in <strong>Safari</strong></li>
                        <li>Tap the <strong>Share</strong> button <Share className="w-3 h-3 inline" /> at the bottom</li>
                        <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                        <li>Tap <strong>Add</strong> in the top right</li>
                      </ol>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-2">
                      <p className="font-bold text-sm" style={{ color: theme.text }}>Android</p>
                      <ol className="text-xs space-y-2 list-decimal list-inside" style={{ color: theme.textMuted }}>
                        <li>Open this app in <strong>Chrome</strong></li>
                        <li>Tap the <strong>three dots</strong> <span className="font-bold">⋮</span> in the top right</li>
                        <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></li>
                        <li>Follow the prompts to install</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                  style={{ backgroundColor: theme.accent, color: theme.bg }}
                >
                  Apply Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
