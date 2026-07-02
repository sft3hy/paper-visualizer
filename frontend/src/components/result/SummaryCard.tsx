import React from 'react';
import { Sparkles } from 'lucide-react';

interface SummaryCardProps {
  titlePlain: string;
  tldr: string;
  originalTitle: string | null;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ titlePlain, tldr, originalTitle }) => {
  return (
    <div className="relative glass-panel rounded-2xl p-6 sm:p-8 overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-950/40 via-slate-950/20 to-cyan-950/10">
      {/* Decorative gradient glowing orb */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none animate-pulse-slow" />
      
      <div className="relative flex flex-col gap-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary w-fit font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          Layman Translation
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-100 font-display leading-tight">
          {titlePlain}
        </h1>

        {originalTitle && (
          <p className="text-xs text-slate-500 font-mono line-clamp-2">
            Original Title: <span className="italic">{originalTitle}</span>
          </p>
        )}

        <hr className="border-slate-800/80 my-2" />

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            The TL;DR
          </h3>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-body">
            {tldr}
          </p>
        </div>
      </div>
    </div>
  );
};
