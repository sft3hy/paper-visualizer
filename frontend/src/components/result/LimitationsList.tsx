import React from 'react';
import { AlertCircle } from 'lucide-react';

interface LimitationsListProps {
  limitations: string[];
}

export const LimitationsList: React.FC<LimitationsListProps> = ({ limitations }) => {
  if (!limitations || limitations.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-950/20">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-amber-500" />
        <h4 className="text-base font-bold text-slate-200 font-display">
          Limitations & Caveats
        </h4>
      </div>
      <ul className="flex flex-col gap-3">
        {limitations.map((lim, idx) => (
          <li key={idx} className="flex gap-2.5 items-start">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 mt-2 flex-shrink-0" />
            <p className="text-sm text-slate-400 leading-relaxed font-body">
              {lim}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};
