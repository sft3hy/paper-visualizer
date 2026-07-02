import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface Finding {
  finding: string;
  why_it_matters: string;
}

interface FindingsListProps {
  findings: Finding[];
}

export const FindingsList: React.FC<FindingsListProps> = ({ findings }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {findings.map((item, idx) => {
        return (
          <div
            key={idx}
            className="group glass-panel rounded-2xl p-6 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 bg-slate-950/10 hover:bg-slate-950/30 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start gap-3.5 mb-4">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <h4 className="text-base font-semibold text-slate-200 font-display leading-snug">
                  {item.finding}
                </h4>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent-purple font-mono flex items-center gap-0.5">
                Why it matters <ChevronRight className="w-3 h-3" />
              </span>
              <p className="text-sm text-slate-400 leading-relaxed font-body">
                {item.why_it_matters}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
