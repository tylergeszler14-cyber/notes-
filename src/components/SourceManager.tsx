import React, { useState } from 'react';
import { Plus, FileText, Link as LinkIcon, Youtube, Trash2, X, Loader2 } from 'lucide-react';
import { Source, SourceType, Theme } from '../types';

interface SourceManagerProps {
  sources: Source[];
  onAddSource: (source: Source) => void;
  onDeleteSource: (id: string) => void;
  theme: Theme;
}

export default function SourceManager({ sources, onAddSource, onDeleteSource, theme }: SourceManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSourceType, setNewSourceType] = useState<SourceType | null>(null);
  const [inputValue, setInputValue] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      onAddSource({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type: file.type.includes('pdf') ? SourceType.PDF : SourceType.DOC,
        content: base64,
        mimeType: file.type,
        addedAt: Date.now(),
      });
      setIsAdding(false);
      setNewSourceType(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAddLink = () => {
    if (!inputValue) return;
    onAddSource({
      id: Math.random().toString(36).substring(7),
      name: inputValue,
      type: inputValue.includes('youtube.com') || inputValue.includes('youtu.be') ? SourceType.YOUTUBE : SourceType.LINK,
      content: inputValue,
      addedAt: Date.now(),
    });
    setInputValue('');
    setIsAdding(false);
    setNewSourceType(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xs font-bold uppercase tracking-widest opacity-50" style={{ color: theme.textMuted }}>Sources ({sources.length})</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <Plus className="w-4 h-4" style={{ color: theme.textMuted }} />
        </button>
      </div>

      <div className="space-y-1">
        {sources.map(source => (
          <div 
            key={source.id} 
            className="group relative p-2 rounded-md hover:bg-white/5 transition-all cursor-default"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center shrink-0" style={{ backgroundColor: theme.card }}>
                {source.type === SourceType.PDF && <FileText className="w-5 h-5" style={{ color: theme.accent }} />}
                {source.type === SourceType.LINK && <LinkIcon className="w-5 h-5" style={{ color: theme.accent }} />}
                {source.type === SourceType.YOUTUBE && <Youtube className="w-5 h-5" style={{ color: theme.accent }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: theme.text }}>{source.name}</p>
                <p className="text-[11px] opacity-50 truncate" style={{ color: theme.textMuted }}>{source.type}</p>
              </div>
              <button 
                onClick={() => onDeleteSource(source.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-red-500 rounded transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#282828] rounded-xl w-full max-w-md p-6 space-y-6 border border-white/10 shadow-2xl" style={{ backgroundColor: theme.card }}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold" style={{ color: theme.text }}>Add Source</h3>
              <button onClick={() => { setIsAdding(false); setNewSourceType(null); }}>
                <X className="w-6 h-6" style={{ color: theme.text }} />
              </button>
            </div>

            {!newSourceType ? (
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setNewSourceType(SourceType.PDF)}
                  className="p-6 bg-white/5 rounded-lg hover:bg-white/10 flex flex-col items-center gap-3 transition-all border border-transparent hover:border-white/10"
                >
                  <FileText className="w-8 h-8" style={{ color: theme.accent }} />
                  <span className="text-sm font-bold" style={{ color: theme.text }}>PDF / Doc</span>
                </button>
                <button 
                  onClick={() => setNewSourceType(SourceType.LINK)}
                  className="p-6 bg-white/5 rounded-lg hover:bg-white/10 flex flex-col items-center gap-3 transition-all border border-transparent hover:border-white/10"
                >
                  <LinkIcon className="w-8 h-8" style={{ color: theme.accent }} />
                  <span className="text-sm font-bold" style={{ color: theme.text }}>Link</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {newSourceType === SourceType.PDF ? (
                  <div className="border-2 border-dashed border-white/10 rounded-lg p-10 text-center hover:border-white/20 transition-colors">
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx" 
                      onChange={handleFileChange}
                      className="hidden" 
                      id="file-upload" 
                    />
                    <label htmlFor="file-upload" className="cursor-pointer space-y-3">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <Plus className="w-6 h-6" style={{ color: theme.accent }} />
                      </div>
                      <p className="text-sm font-bold" style={{ color: theme.text }}>Choose a file</p>
                      <p className="text-xs opacity-50" style={{ color: theme.textMuted }}>PDF, DOC, DOCX up to 10MB</p>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Paste URL (YouTube, Article, etc.)"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full p-4 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-sm"
                      style={{ color: theme.text }}
                    />
                    <button 
                      onClick={handleAddLink}
                      className="w-full py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform"
                      style={{ backgroundColor: theme.accent, color: theme.bg }}
                    >
                      Add Source
                    </button>
                  </div>
                )}
                <button 
                  onClick={() => setNewSourceType(null)}
                  className="w-full py-2 text-xs font-bold opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: theme.text }}
                >
                  Back
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
