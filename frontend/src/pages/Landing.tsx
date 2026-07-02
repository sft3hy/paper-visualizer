import React from 'react';
import { FileDropzone } from '../components/upload/FileDropzone';
import { ArxivSearch } from '../components/search/ArxivSearch';
import { Sparkles, ScanEye } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 py-8 sm:py-16 flex flex-col gap-12 sm:gap-16">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent-purple/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <div className="relative flex flex-col items-center text-center gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] sm:text-xs font-semibold text-slate-400 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Simplifying Complex Science
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-display text-slate-100 flex items-center gap-3">
          <ScanEye className="w-10 h-10 sm:w-14 sm:h-14 text-primary" />
          Paper<span className="text-gradient-cyan">Lens</span>
        </h1>

        <p className="text-sm sm:text-lg text-slate-400 max-w-xl leading-relaxed font-body">
          Translate dense academic research papers into clear, interactive, layperson-friendly visual explainers. No PhD required.
        </p>
      </div>

      {/* Main Actions Container */}
      <div className="relative flex flex-col gap-8 w-full z-10">
        
        {/* Dropzone */}
        <div className="w-full">
          <FileDropzone />
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-800/80"></div>
          </div>
          <div className="relative">
            <span className="bg-background px-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Or search arXiv
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="w-full">
          <ArxivSearch />
        </div>
      </div>

      {/* Footer / Value prop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center border-t border-slate-900 pt-8 sm:pt-12 text-slate-500 text-xs font-mono max-w-3xl mx-auto w-full">
        <div className="flex flex-col gap-1.5 items-center">
          <span className="text-slate-400 font-bold font-display text-sm">1. Local Processing</span>
          <span>PDF text extraction is executed inside your browser. No file uploads.</span>
        </div>
        <div className="flex flex-col gap-1.5 items-center">
          <span className="text-slate-400 font-bold font-display text-sm">2. AI Explainer</span>
          <span>Groq Llama 3.3 digests structured facts based strictly on the text.</span>
        </div>
        <div className="flex flex-col gap-1.5 items-center">
          <span className="text-slate-400 font-bold font-display text-sm">3. D3 Visualizations</span>
          <span>Explore relationships interactively with custom force diagrams.</span>
        </div>
      </div>

    </div>
  );
};
