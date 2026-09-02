import React from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

interface ErrorStateProps {
  message: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message }) => {
  const { reset } = useAppStore();

  return (
    <div className="w-full max-w-lg mx-auto p-6 sm:p-8 rounded-xl paper-panel border border-red-900/30 bg-gradient-to-b from-red-50/50 to-background shadow-sm flex flex-col items-center text-center gap-5">
      <div className="p-3.5 rounded-full bg-red-100/50 border border-red-200 text-accent-burgundy">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold font-display text-accent-burgundy">
          Extraction Failed
        </h3>
        <p className="text-sm text-text/60 font-body leading-relaxed max-h-[150px] overflow-y-auto pr-1">
          {message}
        </p>
      </div>

      <div className="flex gap-3 w-full mt-2">
        <button
          onClick={reset}
          className="flex-1 px-4 py-2.5 rounded-lg bg-accent-gold hover:bg-accent-gold-light text-text font-semibold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  );
};
