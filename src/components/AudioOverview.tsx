import React, { useState, useRef } from 'react';
import { Mic, Play, Pause, Loader2, Volume2, Download } from 'lucide-react';
import { Source, Theme } from '../types';
import * as gemini from '../services/gemini';

interface AudioOverviewProps {
  sources: Source[];
  theme: Theme;
}

export default function AudioOverview({ sources, theme }: AudioOverviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (sources.length === 0) return;
    setIsGenerating(true);
    try {
      const combinedText = sources.map(s => `${s.name}: ${s.summary || s.content.substring(0, 500)}`).join('\n\n');
      const base64Audio = await gemini.generateAudioOverview(combinedText);
      
      if (base64Audio) {
        const blob = await fetch(`data:audio/wav;base64,${base64Audio}`).then(r => r.blob());
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }
    } catch (error) {
      console.error("Error generating audio:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8" style={{ backgroundColor: theme.bg }}>
      <div 
        className="max-w-2xl w-full p-12 rounded-2xl text-center space-y-8 shadow-2xl"
        style={{ backgroundColor: theme.card }}
      >
        <div className="space-y-4">
          <div 
            className="w-20 h-20 mx-auto flex items-center justify-center rounded-full"
            style={{ backgroundColor: theme.accent, color: theme.bg }}
          >
            <Mic className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tighter" style={{ color: theme.text }}>Audio Overview</h2>
            <p className="text-sm opacity-60" style={{ color: theme.textMuted }}>Turn your research into a conversational podcast between two AI hosts.</p>
          </div>
        </div>

        {!audioUrl ? (
          <button
            onClick={handleGenerate}
            disabled={isGenerating || sources.length === 0}
            className="w-full py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            style={{ backgroundColor: theme.accent, color: theme.bg }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Podcast...
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" />
                Generate Audio Overview
              </>
            )}
          </button>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg"
                style={{ backgroundColor: theme.accent, color: theme.bg }}
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>
              <a
                href={audioUrl}
                download="notebook-overview.wav"
                className="p-4 rounded-full border transition-all hover:bg-white/5"
                style={{ borderColor: theme.accent, color: theme.accent }}
              >
                <Download className="w-6 h-6" />
              </a>
            </div>
            
            <div className="space-y-2">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full animate-pulse" style={{ backgroundColor: theme.accent, width: '40%' }} />
              </div>
              <div className="flex justify-between font-bold text-[10px] uppercase opacity-50" style={{ color: theme.textMuted }}>
                <span>0:00</span>
                <span>AI Hosts: Alex & Sam</span>
                <span>5:00</span>
              </div>
            </div>

            <button 
              onClick={() => setAudioUrl(null)}
              className="text-[10px] font-bold uppercase opacity-50 hover:opacity-100 underline underline-offset-4"
              style={{ color: theme.textMuted }}
            >
              Regenerate Overview
            </button>
          </div>
        )}

        <audio 
          ref={audioRef} 
          src={audioUrl || undefined} 
          onEnded={() => setIsPlaying(false)}
          className="hidden" 
        />

        <div className="pt-8 border-t border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: theme.textMuted }}>
            Powered by Gemini 2.5 Flash TTS // Multi-Speaker Synthesis
          </p>
        </div>
      </div>
    </div>
  );
}
