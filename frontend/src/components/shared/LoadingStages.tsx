import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Check, Circle } from 'lucide-react';

interface LoadingStagesProps {
  currentStage: number;
}

export const LoadingStages: React.FC<LoadingStagesProps> = ({ currentStage }) => {
  const stages = [
    { label: 'Reading PDF pages', desc: 'Parsing PDF format and extracting content client-side.' },
    { label: 'Formatting layout', desc: 'Applying heuristics to identify Abstract, Intro, and Conclusions.' },
    { label: 'Translating concepts', desc: 'Calling Groq (Llama 3.3) to digest complex academic language.' },
    { label: 'Synthesizing visual presentation', desc: 'Drafting diagrams, glossary terms, and step-by-step methodologies.' },
  ];

  const progressPercent = Math.min(((currentStage + 0.5) / stages.length) * 100, 95);

  return (
    <div className="w-full max-w-lg mx-auto p-6 sm:p-8 rounded-xl paper-panel border border-border bg-panel shadow-sm flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 items-center text-center">
        <h3 className="text-xl font-bold font-display text-accent-gold">
          Generating Explainer
        </h3>
        <p className="text-xs text-text/60 font-mono">
          This takes 5-15 seconds depending on document length.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-border rounded-full overflow-hidden relative">
        <motion.div
          className="h-full bg-accent-gold rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
      </div>

      {/* Stages List */}
      <div className="flex flex-col gap-5">
        {stages.map((stage, idx) => {
          const isDone = currentStage > idx;
          const isActive = currentStage === idx;

          return (
            <div
              key={idx}
              className={`flex items-start gap-4 transition-all duration-300 ${isActive ? 'opacity-100 scale-[1.01]' : isDone ? 'opacity-80' : 'opacity-40'
                }`}
            >
              <div className="mt-0.5">
                {isDone ? (
                  <div className="w-5 h-5 rounded-full bg-accent-gold/20 border border-accent-gold text-accent-gold flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                ) : isActive ? (
                  <div className="w-5 h-5 rounded-full border border-accent-gold text-accent-gold flex items-center justify-center">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-border text-text/40 flex items-center justify-center">
                    <Circle className="w-2.5 h-2.5 fill-transparent stroke-none" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                <span className={`text-sm font-semibold font-display ${isActive ? 'text-accent-gold' : isDone ? 'text-text/80' : 'text-text/40'
                  }`}>
                  {stage.label}
                </span>
                <span className="text-xs text-text/60 font-body leading-normal">
                  {stage.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
