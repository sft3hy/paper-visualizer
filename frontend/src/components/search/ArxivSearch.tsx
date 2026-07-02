import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { searchArxiv } from '../../lib/api/client';
import { ArxivResultCard } from './ArxivResultCard';

export const ArxivSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="w-full flex flex-col gap-6">
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search academic papers on arXiv (e.g. attention is all you need, llama 3)..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl border text-sm glass-input text-slate-100 font-body placeholder:text-slate-500"
          />
          <Search className="absolute left-4 w-5 h-5 text-slate-500" />
          <button
            type="submit"
            className="absolute right-2 px-5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-xs transition-colors hover:text-white"
          >
            Search
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-slate-500 font-mono">Querying arXiv database...</p>
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl border border-red-950 bg-red-950/20 text-red-400 text-sm flex gap-2">
          <span className="font-bold">Error:</span> {(error as Error).message}
        </div>
      )}

      {!isLoading && !isError && papers && papers.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              arXiv Search Results ({papers.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <ArxivResultCard key={paper.id} paper={paper} />
            ))}
          </div>
        </div>
      )}

      {!isLoading && !isError && papers && papers.length === 0 && searchQuery && (
        <div className="text-center py-12 glass-panel rounded-2xl border border-slate-900 bg-slate-950/5">
          <p className="text-slate-400 text-sm">No papers found for "{searchQuery}". Try adjusting your keywords.</p>
        </div>
      )}

      {!searchQuery && !isLoading && (
        <div className="flex flex-wrap gap-2 items-center justify-center py-2">
          <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" />
            Try searching:
          </span>
          {['Attention Is All You Need', 'Llama 3', 'Generative Adversarial Nets', 'LoRA: Low-Rank Adaptation'].map((t) => (
            <button
              key={t}
              onClick={() => {
                setQuery(t);
                setSearchQuery(t);
              }}
              className="px-3 py-1.5 rounded-full bg-slate-950/40 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-xs font-mono"
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
