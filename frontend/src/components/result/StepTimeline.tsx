import React from 'react';
import { motion } from 'framer-motion';

interface Step {
  step_title: string;
  step_description: string;
}

interface StepTimelineProps {
  steps: Step[];
}

export const StepTimeline: React.FC<StepTimelineProps> = ({ steps }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <div className="relative py-4 pl-4 sm:pl-8">
      {/* Central line */}
      <div className="absolute left-8 sm:left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/80 via-accent-purple/50 to-slate-800" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        className="flex flex-col gap-8"
      >
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          
          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="relative flex items-start gap-6 sm:gap-10 group"
            >
              {/* Step indicator node */}
              <div className="z-10 flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-400 group-hover:border-primary group-hover:text-primary transition-all duration-300 font-mono flex-shrink-0 group-hover:scale-110 shadow-lg group-hover:shadow-primary/20">
                {stepNum}
              </div>

              {/* Step card content */}
              <div className="flex-1 glass-panel rounded-xl p-5 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 bg-slate-950/20 group-hover:bg-slate-950/40">
                <h4 className="text-base font-semibold text-slate-200 font-display mb-2 group-hover:text-primary-light transition-colors duration-200">
                  {step.step_title}
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-200">
                  {step.step_description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
