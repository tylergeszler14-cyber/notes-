import React from 'react';
import { BookOpen, HelpCircle, Calendar, List, Loader2 } from 'lucide-react';
import { NotebookGuide, Theme } from '../types';

interface NotebookGuideViewProps {
  guide: NotebookGuide | null;
  isLoading: boolean;
  theme: Theme;
}

export default function NotebookGuideView({ guide, isLoading, theme }: NotebookGuideViewProps) {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: theme.accent }} />
        <p className="font-bold text-xs uppercase tracking-widest" style={{ color: theme.textMuted }}>Analyzing sources and generating guide...</p>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
        <BookOpen className="w-12 h-12" style={{ color: theme.textMuted }} />
        <div className="space-y-1">
          <h3 className="font-bold text-xl" style={{ color: theme.text }}>No Guide Generated</h3>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.textMuted }}>Click "Generate Guide" in the sidebar to create one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-2 border-b border-white/5 pb-6">
          <h2 className="text-4xl font-black tracking-tighter" style={{ color: theme.text }}>Notebook Guide</h2>
          <p className="text-xs font-bold uppercase tracking-widest opacity-50" style={{ color: theme.textMuted }}>Synthesized from your uploaded sources</p>
        </div>

        {/* Table of Contents */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5" style={{ color: theme.accent }} />
            <h3 className="text-sm uppercase tracking-widest font-bold" style={{ color: theme.text }}>Table of Contents</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guide.tableOfContents.map((item, i) => (
              <div 
                key={i} 
                className="p-4 rounded-lg flex items-center gap-4 group hover:scale-[1.02] transition-all cursor-default"
                style={{ backgroundColor: theme.card }}
              >
                <span className="font-bold text-[10px] opacity-50" style={{ color: theme.textMuted }}>{(i + 1).toString().padStart(2, '0')}</span>
                <span className="text-sm font-bold" style={{ color: theme.text }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" style={{ color: theme.accent }} />
            <h3 className="text-sm uppercase tracking-widest font-bold" style={{ color: theme.text }}>Frequently Asked Questions</h3>
          </div>
          <div className="space-y-4">
            {guide.faq.map((item, i) => (
              <div 
                key={i} 
                className="p-6 rounded-xl space-y-2 shadow-lg"
                style={{ backgroundColor: theme.card }}
              >
                <h4 className="font-bold text-lg" style={{ color: theme.accent }}>Q: {item.question}</h4>
                <p className="text-sm leading-relaxed opacity-80" style={{ color: theme.text }}>A: {item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        {guide.timeline && guide.timeline.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: theme.accent }} />
              <h3 className="text-sm uppercase tracking-widest font-bold" style={{ color: theme.text }}>Timeline of Events</h3>
            </div>
            <div className="relative border-l-2 ml-4 pl-8 space-y-8 py-4" style={{ borderColor: theme.card }}>
              {guide.timeline.map((item, i) => (
                <div key={i} className="relative">
                  <div 
                    className="absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4" 
                    style={{ backgroundColor: theme.accent, borderColor: theme.bg }}
                  />
                  <div className="space-y-1">
                    <span 
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                      style={{ backgroundColor: theme.accent, color: theme.bg }}
                    >
                      {item.date}
                    </span>
                    <p className="text-sm font-bold" style={{ color: theme.text }}>{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
