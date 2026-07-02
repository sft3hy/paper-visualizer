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
      <aside className="w-80 border-r border-slate-900 bg-slate-950/20 backdrop-blur-md p-6 flex flex-col gap-6 overflow-y-auto hidden md:flex flex-shrink-0">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-900/60">
          <FileUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-display">
            Direct Ingestion
          </h3>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-300">Upload PDF</span>
          <span className="text-[10px] text-slate-500">Analyze any custom research document</span>
        </div>

        <FileDropzone />

        <div className="mt-auto p-4 rounded-xl border border-slate-900 bg-slate-950/40 text-[11px] text-slate-500 font-mono leading-relaxed">
          <p className="font-semibold text-slate-400 mb-1">How it works:</p>
          <ol className="list-decimal pl-4 flex flex-col gap-1">
            <li>Drop a PDF or search arXiv.</li>
            <li>We parse the text client-side.</li>
            <li>Llama 4 processes findings.</li>
            <li>Explore the visual results map.</li>
          </ol>
        </div>
      </aside>

      {/* Main Panel - Chat-like Search Interface */}
      <main className="flex-1 flex flex-col justify-between h-full relative overflow-hidden bg-slate-950/5">
        
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent-purple/5 rounded-full blur-3xl pointer-events-none" />

        {/* Scrollable Chat Area */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 scroll-smooth"
        >
          {/* Welcome State (If no search query) */}
          {!searchQuery && !isLoading && (
            <div className="flex-1 flex flex-col justify-center items-center text-center gap-6 max-w-2xl mx-auto my-auto py-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] sm:text-xs font-semibold text-slate-400 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Translating Academic Complexity
              </div>

              <div className="flex flex-col items-center gap-3">
                <ScanEye className="w-12 h-12 text-primary" />
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-slate-100">
                  Search & Visualize Research
                </h1>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed font-body">
                Search the arXiv database below to generate interactive, simplified explainers, or drop a PDF into the sidebar.
              </p>

              {/* Suggestions Grid */}
              <div className="flex flex-col gap-3 w-full mt-4">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
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
                      className="px-3 py-1.5 rounded-full bg-slate-950/40 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-xs font-mono"
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
                <div className="max-w-[85%] bg-slate-900 border border-slate-800 rounded-2xl rounded-tr-none px-4 py-3 text-sm text-slate-200 font-body shadow-lg">
                  Search arXiv for "<span className="text-primary-light font-semibold font-mono">{searchQuery}</span>"
                </div>
              </div>

              {/* Loader Bubble */}
              {isLoading && (
                <div className="flex justify-start items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <ScanEye className="w-4 h-4" />
                  </div>
                  <div className="max-w-[85%] bg-slate-950/40 border border-slate-900 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-xs text-slate-400 font-mono">Retrieving matching papers from arXiv...</span>
                  </div>
                </div>
              )}

              {/* Error Bubble */}
              {isError && (
                <div className="flex justify-start items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-950/30 text-red-500 border border-red-900/50">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="max-w-[85%] bg-red-950/10 border border-red-950 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-red-400 font-mono">
                    <span className="font-bold">Error querying database:</span> {(error as Error).message}
                  </div>
                </div>
              )}

              {/* Results Bubble */}
              {!isLoading && !isError && papers && (
                <div className="flex justify-start items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                    <ScanEye className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="bg-slate-950/20 border border-slate-900 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-400 font-mono w-fit">
                      Found {papers.length} publications. Click "Lens Explainer" to synthesize a visual overview.
                    </div>

                    {papers.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {papers.map((paper) => (
                          <ArxivResultCard key={paper.id} paper={paper} />
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center border border-slate-900 bg-slate-950/30 rounded-xl">
                        <p className="text-slate-500 text-xs">No papers found. Try adjusting keywords.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Bottom Pinned Search Input */}
        <div className="p-6 border-t border-slate-900 bg-slate-950/30 backdrop-blur-md flex justify-center w-full z-10">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-2xl">
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search research topics or papers (e.g. Attention, GAN, LoRA)..."
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl border text-sm glass-input text-slate-100 font-body placeholder:text-slate-500"
              />
              <Search className="absolute left-4 w-5 h-5 text-slate-500" />
              <button
                type="submit"
                disabled={query.trim().length === 0}
                className="absolute right-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-light text-slate-950 font-bold text-xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
