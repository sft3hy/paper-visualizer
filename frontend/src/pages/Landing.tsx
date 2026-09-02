import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileDropzone } from '../components/upload/FileDropzone';
import { searchArxiv } from '../lib/api/client';
import { ArxivResultCard } from '../components/search/ArxivResultCard';
import { Sparkles, ScanEye, Search, Loader2, AlertCircle, FileUp } from 'lucide-react';

export const Landing: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const { data: papers, isLoading, isError, error } = useQuery({
    queryKey: ['arxivSearch', searchQuery],
    queryFn: () => searchArxiv(searchQuery),
    enabled: searchQuery.trim().length > 2,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchQuery(query);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setSearchQuery(suggestion);
  };

  // Scroll to bottom when papers load or search starts
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [papers, isLoading]);

  return (
    <div className="flex w-full h-[calc(100vh-68px)] overflow-hidden">
      
      {/* Sidebar - PDF Drag & Drop */}
      <aside className="w-80 border-r border-border bg-background p-6 flex flex-col gap-6 overflow-y-auto hidden md:flex flex-shrink-0">
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <FileUp className="w-4 h-4 text-accent-gold" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-text font-display">
            Direct Ingestion
          </h3>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-text/80">Upload PDF</span>
          <span className="text-[10px] text-text/60">Analyze any custom research document</span>
        </div>

        <FileDropzone />

        <div className="mt-auto p-4 border border-border bg-panel rounded-lg text-[11px] text-text/70 font-mono leading-relaxed">
          <p className="font-semibold text-accent-gold mb-1">How it works:</p>
          <ol className="list-decimal pl-4 flex flex-col gap-1">
            <li>Drop a PDF or search arXiv.</li>
            <li>We parse the text client-side.</li>
            <li>Llama 3.3 processes findings.</li>
            <li>Explore the visual results map.</li>
          </ol>
        </div>
      </aside>

      {/* Main Panel - Research Library Interface */}
      <main className="flex-1 flex flex-col justify-between h-full relative overflow-hidden bg-background">
        
        {/* Scrollable Content Area */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 scroll-smooth"
        >
          {/* Welcome State (If no search query) */}
          {!searchQuery && !isLoading && (
            <div className="flex-1 flex flex-col justify-center items-center text-center gap-6 max-w-2xl mx-auto my-auto py-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-accent-gold/30 rounded-full bg-panel text-[10px] sm:text-xs font-semibold text-accent-gold font-mono fade-in">
                <Sparkles className="w-3.5 h-3.5" />
                Academic Research Simplified
              </div>

              <div className="flex flex-col items-center gap-3">
                <ScanEye className="w-12 h-12 text-accent-gold" />
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-text">
                  Search & Visualize Research
                </h1>
              </div>

              <p className="text-sm text-text/70 leading-relaxed font-body max-w-lg">
                Search the arXiv database below to generate interactive, simplified explainers, or drop a PDF into the sidebar.
              </p>

              {/* Suggestions Grid */}
              <div className="flex flex-col gap-3 w-full mt-4">
                <span className="text-[10px] text-text/60 font-mono uppercase tracking-wider">
                  Suggested Searches
                </span>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    'Attention Is All You Need',
                    'Llama 3',
                    'Generative Adversarial Nets',
                    'LoRA: Low-Rank Adaptation',
                  ].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleSuggestionClick(t)}
                      className="px-3 py-1.5 border border-border bg-panel hover:bg-accent-gold/5 text-text/70 hover:text-accent-gold transition-colors text-xs font-mono rounded-md"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat Flow (If search query exists) */}
          {searchQuery && (
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
              
              {/* User Bubble */}
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-accent-gold/5 border border-accent-gold/20 rounded-lg rounded-tr-none px-4 py-3 text-sm text-text/80 font-body shadow-sm fade-in">
                  Search arXiv for "<span className="text-accent-gold font-semibold font-mono">{searchQuery}</span>"
                </div>
              </div>

              {/* Loader Bubble */}
              {isLoading && (
                <div className="flex justify-start items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent-gold/10 text-accent-gold border border-accent-gold/20">
                    <ScanEye className="w-4 h-4" />
                  </div>
                  <div className="max-w-[85%] bg-panel border border-border rounded-lg rounded-tl-none px-4 py-3 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-accent-gold animate-spin" />
                    <span className="text-xs text-text/60 font-mono">Retrieving matching papers from arXiv...</span>
                  </div>
                </div>
              )}

              {/* Error Bubble */}
              {isError && (
                <div className="flex justify-start items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-950/30 text-red-500 border border-red-900/50">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="max-w-[85%] bg-red-950/10 border border-red-950 rounded-lg rounded-tl-none px-4 py-3 text-xs text-red-400 font-mono">
                    <span className="font-bold">Error querying database:</span> {(error as Error).message}
                  </div>
                </div>
              )}

              {/* Results Bubble */}
              {!isLoading && !isError && papers && (
                <div className="flex justify-start items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent-gold/10 text-accent-gold border border-accent-gold/20 flex-shrink-0">
                    <ScanEye className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="bg-panel border border-border rounded-lg px-4 py-3 text-xs text-text/60 font-mono w-fit">
                      Found {papers.length} publications. Click "Lens Explainer" to synthesize a visual overview.
                    </div>

                    {papers.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {papers.map((paper) => (
                          <ArxivResultCard key={paper.id} paper={paper} />
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center border border-border bg-panel rounded-lg">
                        <p className="text-text/50 text-xs">No papers found. Try adjusting keywords.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Bottom Pinned Search Input */}
        <div className="p-6 border-t border-border bg-background flex justify-center w-full z-10">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-2xl">
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search research topics or papers (e.g. Attention, GAN, LoRA)..."
                className="w-full pl-12 pr-28 py-3.5 rounded-lg border text-sm paper-input text-text font-body placeholder:text-text/40"
              />
              <Search className="absolute left-4 w-5 h-5 text-text/40" />
              <button
                type="submit"
                disabled={query.trim().length === 0}
                className="absolute right-2 px-5 py-2 rounded-lg bg-accent-gold hover:bg-accent-gold-light text-text font-bold text-xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search
              </button>
            </div>
          </form>
        </div>

      </main>

    </div>
  );
};
