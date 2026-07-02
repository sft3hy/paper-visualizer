import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, ArrowLeft, BookOpen, Network, HelpCircle, FileText } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { SummaryCard } from '../components/result/SummaryCard';
import { FindingsList } from '../components/result/FindingsList';
import { StepTimeline } from '../components/result/StepTimeline';
import { ConceptMapDiagram } from '../components/result/ConceptMapDiagram';
import { AnalogyBox } from '../components/result/AnalogyBox';
import { GlossaryGrid } from '../components/result/GlossaryGrid';
import { LimitationsList } from '../components/result/LimitationsList';

export const Result: React.FC = () => {
  const { explainerData, originalPaperTitle, pdfUrl, reset } = useAppStore();
  const explainerRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!explainerData) return null;

  const handleExportImage = async () => {
    if (!explainerRef.current) return;
    setIsExporting(true);
    try {
      // Small delay to ensure D3 elements and layouts are fully settled
      await new Promise((r) => setTimeout(r, 300));
      
      const dataUrl = await toPng(explainerRef.current, {
        cacheBust: true,
        backgroundColor: '#0B0F19',
        style: {
          padding: '24px',
          borderRadius: '16px',
        },
      });

      const filename = `${explainerData.title_plain
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .substring(0, 40)}-explainer.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
      alert('Failed to export explainer as an image. This can happen on some browsers due to security restrictions.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-10 flex flex-col gap-6 sm:gap-8">
      
      {/* Top Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-900">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition-all active:scale-95 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Translate Another Paper
        </button>

        <div className="flex gap-2 w-full sm:w-auto">
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              View Original PDF
            </a>
          )}
          
          <button
            onClick={handleExportImage}
            disabled={isExporting}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-slate-950 font-bold text-xs shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export as Image'}
          </button>
        </div>
      </div>

      {/* Main Explainer Sheet (Targets for exporting) */}
      <div ref={explainerRef} className="flex flex-col gap-8 sm:gap-10">
        
        {/* Hero Section */}
        <SummaryCard
          titlePlain={explainerData.title_plain}
          tldr={explainerData.tldr}
          originalTitle={originalPaperTitle}
        />

        {/* Multi-column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (Main text and lists) - 7 cols */}
          <div className="lg:col-span-7 flex flex-col gap-8 sm:gap-10">
            
            {/* The Big Picture */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" />
                The Big Picture
              </h3>
              <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 bg-slate-950/20">
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-body">
                  {explainerData.big_picture}
                </p>
              </div>
            </div>

            {/* Key Findings */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                <Network className="w-4 h-4 text-primary" />
                Key Breakthroughs & Findings
              </h3>
              <FindingsList findings={explainerData.key_findings} />
            </div>

            {/* Simplified Methodology */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-primary" />
                Simplified Methodology
              </h3>
              <StepTimeline steps={explainerData.method_simplified} />
            </div>

          </div>

          {/* Right Column (Visualizations, Glossary, Limitations) - 5 cols */}
          <div className="lg:col-span-5 flex flex-col gap-8 sm:gap-10">
            
            {/* Interactive Concept Map */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                <Network className="w-4 h-4 text-primary" />
                Interactive Concept Map
              </h3>
              <ConceptMapDiagram
                nodes={explainerData.concept_map_nodes}
                edges={explainerData.concept_map_edges}
              />
            </div>

            {/* Real World Analogy */}
            <AnalogyBox analogy={explainerData.real_world_analogy} />

            {/* Glossary terms */}
            {explainerData.glossary.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Jargon Decoder (Glossary)
                </h3>
                <GlossaryGrid terms={explainerData.glossary} />
              </div>
            )}

            {/* Limitations */}
            {explainerData.limitations.length > 0 && (
              <LimitationsList limitations={explainerData.limitations} />
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
