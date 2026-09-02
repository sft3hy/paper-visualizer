import React from 'react';
import { useAppStore } from './store/appStore';
import { Landing } from './pages/Landing';
import { Result } from './pages/Result';
import { LoadingStages } from './components/shared/LoadingStages';
import { ErrorState } from './components/shared/ErrorState';
import { ScanEye, Github } from 'lucide-react';

const App: React.FC = () => {
  const { status, error, loadingStage } = useAppStore();

  return (
    <div className="min-h-screen bg-background text-text flex flex-col justify-between selection:bg-accent-gold/20">

      {/* Navigation Header */}
      <header className="w-full py-4 px-6 border-b border-border bg-background sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer">
            <ScanEye className="w-6 h-6 text-accent-gold" />
            <span className="font-bold font-display text-lg tracking-tight">
              Paper<span className="text-accent-gold">Lens</span>
            </span>
          </div>

          <a
            href="https://github.com/sft3hy/paper-visualizer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono text-text/60 hover:text-accent-gold transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col justify-center items-center py-8">
        {status === 'idle' && <Landing />}

        {(status === 'extracting' || status === 'generating') && (
          <div className="w-full px-4 flex justify-center items-center">
            <LoadingStages currentStage={loadingStage} />
          </div>
        )}

        {status === 'success' && <Result />}

        {status === 'error' && (
          <div className="w-full px-4 flex justify-center items-center">
            <ErrorState message={error || 'An unknown error occurred.'} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-6 border-t border-border text-center text-xs text-text/60 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; {new Date().getFullYear()} PaperLens. For the curious mind.</span>
          <span className="flex items-center gap-1">
            Powered by <a href="https://groq.com" target="_blank" rel="noreferrer" className="hover:text-accent-gold transition-colors font-semibold">Groq</a> &amp; <a href="https://arxiv.org" target="_blank" rel="noreferrer" className="hover:text-accent-gold transition-colors font-semibold">arXiv</a>.
          </span>
        </div>
      </footer>

    </div>
  );
};

export default App;
