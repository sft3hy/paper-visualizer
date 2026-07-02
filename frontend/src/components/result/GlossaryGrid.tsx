import React from 'react';
import { BookOpen } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  definition: string;
}

interface GlossaryGridProps {
  terms: GlossaryTerm[];
}

export const GlossaryGrid: React.FC<GlossaryGridProps> = ({ terms }) => {
  if (!terms || terms.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {terms.map((item, idx) => {
        return (
          <div
            key={idx}
            className="glass-panel rounded-xl p-4 border border-slate-800/80 bg-slate-950/5 hover:border-slate-700/80 transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary/80" />
              <h5 className="text-sm font-semibold text-slate-200 font-display">
                {item.term}
              </h5>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-body">
              {item.definition}
            </p>
          </div>
        );
      })}
    </div>
  );
};
