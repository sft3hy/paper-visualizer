import React, { useState } from 'react';
import { Calendar, Users, FileDown, ExternalLink } from 'lucide-react';
import { type ArxivPaper } from '../../lib/api/client';
import { useAppStore } from '../../store/appStore';
import { extractTextFromPdf } from '../../lib/pdf/extractor';
import { generateExplainer } from '../../lib/api/client';

interface ArxivResultCardProps {
  paper: ArxivPaper;
}

export const ArxivResultCard: React.FC<ArxivResultCardProps> = ({ paper }) => {
  const { setPaperInfo, setExtractedText, setExplainerData, setStatus, setError, setLoadingStage } = useAppStore();
  const [isReading, setIsReading] = useState(false);

  const handleSelectPaper = async () => {
    setIsReading(true);
    setStatus('extracting');
    setPaperInfo(paper.title, paper.pdfUrl);

    try {
      setLoadingStage(0); // Reading
      
      // ArXiv PDFs are usually hosted on https://arxiv.org/pdf/xxxx.pdf.
      // In some browser configurations, direct CORS access might be blocked.
      // We will try direct loading first.
      const extractedText = await extractTextFromPdf(paper.pdfUrl, (progress) => {
        if (progress.stage === 'parsing') {
          // stage 0
        } else if (progress.stage === 'structuring') {
          setLoadingStage(1); // formatting
        }
      });

      setExtractedText(extractedText);
      setLoadingStage(2); // Translating
      setStatus('generating');

      const explainer = await generateExplainer(extractedText, paper.title);
      setLoadingStage(3); // Synthesizing
      setExplainerData(explainer);
    } catch (err: any) {
      console.error('Error fetching paper PDF directly:', err);
      // Fallback: If direct CORS is blocked, we can notify the user or try a proxy if configured.
      // Let's explain CORS error clearly or try to download via proxy if we want,
      // but let's first output a helpful error.
      setError(
        `Failed to parse PDF directly from arXiv. You can click the "arXiv link" button to view it, or download the PDF and drag-and-drop it here manually. Error: ${err.message}`
      );
    } finally {
      setIsReading(false);
    }
  };

  const formattedDate = paper.published
    ? new Date(paper.published).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div className="paper-panel rounded-lg p-5 border border-border hover:border-accent-gold/60 hover:bg-accent-gold/5 transition-all duration-300 flex flex-col justify-between gap-4">
      <div className="flex flex-col gap-2">
        {/* Date and actions */}
        <div className="flex justify-between items-center text-[10px] text-text/60 font-mono">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          <span className="text-accent-gold font-semibold">arXiv:{paper.id}</span>
        </div>

        {/* Title */}
        <h4 className="text-sm sm:text-base font-semibold text-text line-clamp-2 font-display leading-snug">
          {paper.title}
        </h4>

        {/* Authors */}
        {paper.authors.length > 0 && (
          <div className="flex items-start gap-1 text-xs text-text/60 font-mono line-clamp-1">
            <Users className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{paper.authors.join(', ')}</span>
          </div>
        )}

        {/* Summary (abstract snippet) */}
        <p className="text-xs text-text/60 line-clamp-3 leading-relaxed mt-1">
          {paper.summary}
        </p>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <button
          onClick={handleSelectPaper}
          disabled={isReading}
          className="flex-1 px-4 py-2 rounded-lg bg-accent-gold hover:bg-accent-gold-light text-text font-bold text-xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          <FileDown className="w-3.5 h-3.5" />
          {isReading ? 'Reading PDF...' : 'Lens Explainer'}
        </button>

        <a
          href={paper.webUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-panel hover:bg-accent-gold/5 border border-border text-text/60 hover:text-accent-gold transition-colors flex items-center justify-center"
          title="Open arXiv page"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
