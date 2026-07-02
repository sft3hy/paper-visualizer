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
    noClick: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative w-full rounded-xl border border-dashed p-6 text-center transition-all duration-300 glass-panel ${
        isDragActive
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : 'border-slate-800 hover:border-slate-700/80 bg-slate-950/20'
      }`}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center justify-center gap-3">
        <div className={`p-3 rounded-full bg-slate-900/50 border transition-all duration-300 ${
          isDragActive ? 'border-primary text-primary scale-110' : 'border-slate-800 text-slate-500'
        }`}>
          <UploadCloud className="w-6 h-6 animate-float" />
        </div>

        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-bold text-slate-300 font-display">
            Drag PDF here
          </h4>
          <p className="text-[10px] text-slate-500 leading-normal max-w-[180px] mx-auto">
            Limit 25MB. Text extraction and formatting happens fully client-side.
          </p>
        </div>

        <button
          type="button"
          onClick={open}
          className="mt-1 px-4 py-2 rounded-lg bg-primary hover:bg-primary-light text-slate-950 font-bold text-xs shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          Choose File
        </button>
      </div>
    </div>
  );
};
