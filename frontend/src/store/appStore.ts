import { create } from 'zustand';
import { type ExplainerData } from '../lib/schema/explainer';

type AppStatus = 'idle' | 'extracting' | 'generating' | 'success' | 'error';

interface AppState {
  originalPaperTitle: string | null;
  pdfUrl: string | null;
  extractedText: string | null;
  explainerData: ExplainerData | null;
  status: AppStatus;
  error: string | null;
  loadingStage: number; // 0: Reading pages, 1: Formatting layout, 2: Groq translation, 3: Synthesizing results

  setPaperInfo: (title: string, pdfUrl: string | null) => void;
  setExtractedText: (text: string) => void;
  setExplainerData: (data: ExplainerData) => void;
  setStatus: (status: AppStatus) => void;
  setError: (error: string | null) => void;
  setLoadingStage: (stage: number) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  originalPaperTitle: null,
  pdfUrl: null,
  extractedText: null,
  explainerData: null,
  status: 'idle',
  error: null,
  loadingStage: 0,

  setPaperInfo: (title, pdfUrl) => set({ originalPaperTitle: title, pdfUrl, error: null }),
  setExtractedText: (text) => set({ extractedText: text }),
  setExplainerData: (data) => set({ explainerData: data, status: 'success', error: null }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: 'error' }),
  setLoadingStage: (stage) => set({ loadingStage: stage }),
  reset: () =>
    set({
      originalPaperTitle: null,
      pdfUrl: null,
      extractedText: null,
      explainerData: null,
      status: 'idle',
      error: null,
      loadingStage: 0,
    }),
}));
