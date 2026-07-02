import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { extractTextFromPdf } from '../../lib/pdf/extractor';
import { generateExplainer } from '../../lib/api/client';

export const FileDropzone: React.FC = () => {
  const { setPaperInfo, setExtractedText, setExplainerData, setStatus, setError, setLoadingStage } = useAppStore();

  const processFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please select a valid PDF research paper.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('PDF file is too large. Please select a paper under 25MB.');
      return;
    }

    setStatus('extracting');
    setPaperInfo(file.name.replace(/\.pdf$/i, ''), null);

    try {
      setLoadingStage(0); // Reading pages
      const extractedText = await extractTextFromPdf(file, (progress) => {
        if (progress.stage === 'parsing') {
          // Keep stage 0 (Reading pages)
        } else if (progress.stage === 'structuring') {
          setLoadingStage(1); // Formatting layout
        }
      });

      setExtractedText(extractedText);
      setLoadingStage(2); // Groq translation
      setStatus('generating');

      const explainer = await generateExplainer(extractedText, file.name);
      setLoadingStage(3); // Synthesizing
      setExplainerData(explainer);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while reading or translating the PDF.');
    }
  }, [setPaperInfo, setExtractedText, setExplainerData, setStatus, setError, setLoadingStage]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    noClick: true, // Allow opening only via button click to make dropzone click-draggable
  });

  return (
    <div
      {...getRootProps()}
      className={`relative w-full rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 glass-panel ${
        isDragActive
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : 'border-slate-800 hover:border-slate-700/80 bg-slate-950/5'
      }`}
    >
      <input { ...getInputProps() } />
      
      <div className="flex flex-col items-center justify-center gap-4">
        <div className={`p-4 rounded-full bg-slate-900 border transition-all duration-300 ${
          isDragActive ? 'border-primary text-primary scale-110' : 'border-slate-800 text-slate-400'
        }`}>
          <UploadCloud className="w-8 h-8 animate-float" />
        </div>

        <div className="flex flex-col gap-1.5 max-w-md">
          <h3 className="text-lg font-bold text-slate-200 font-display">
            Drag & drop your research paper
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Support PDF files up to 25MB. Text extraction and formatting happens fully client-side.
          </p>
        </div>

        <button
          type="button"
          onClick={open}
          className="mt-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-slate-950 font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Choose PDF File
        </button>
      </div>
    </div>
  );
};
