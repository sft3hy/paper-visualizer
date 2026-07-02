import React from 'react';
import { Lightbulb } from 'lucide-react';

interface AnalogyBoxProps {
  analogy: string;
}

export const AnalogyBox: React.FC<AnalogyBoxProps> = ({ analogy }) => {
  return (
    <div className="relative glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-br from-slate-950/40 via-slate-950/20 to-accent-purple/10 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-accent-purple/10 rounded-full blur-3xl -ml-10 -mt-10 pointer-events-none" />

      <div className="flex flex-col sm:flex-row gap-5 items-start">
        <div className="p-3.5 rounded-xl bg-accent-purple/10 border border-accent-purple/20 text-accent-purple flex-shrink-0">
          <Lightbulb className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="text-lg font-bold text-slate-200 font-display">
            Real-World Analogy
          </h3>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-body italic">
            "{analogy}"
          </p>
        </div>
      </div>
    </div>
  );
};
