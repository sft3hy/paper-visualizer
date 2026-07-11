import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker source using a reliable CDN that matches the package version dynamically
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface ExtractionProgress {
  currentPage: number;
  totalPages: number;
  stage: 'loading' | 'parsing' | 'structuring' | 'done';
}

export async function extractTextFromPdf(
  source: File | string,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<string> {
  onProgress?.({ currentPage: 0, totalPages: 0, stage: 'loading' });

  let pdfData: Uint8Array | string;

  if (source instanceof File) {
    const arrayBuffer = await source.arrayBuffer();
    pdfData = new Uint8Array(arrayBuffer);
  } else {
    // For URLs, we fetch them directly. ArXiv PDF links are typically CORS-enabled for web clients,
    // but if not, they can be proxied.
    pdfData = source;
  }

  const loadingTask = pdfjsLib.getDocument({
    data: pdfData instanceof Uint8Array ? pdfData : undefined,
    url: typeof pdfData === 'string' ? pdfData : undefined,
  });

  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  let fullText = '';

  onProgress?.({ currentPage: 0, totalPages, stage: 'parsing' });

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Joint texts with smart space handling
    let lastY: number | null = null;
    let pageText = '';
    
    for (const item of textContent.items) {
      if ('str' in item) {
        // Simple heuristic: if item is on a new line, add a newline
        const currentY = item.transform[5];
        if (lastY !== null && Math.abs(currentY - lastY) > 5) {
          pageText += '\n';
        } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
          pageText += ' ';
        }
        pageText += item.str;
        lastY = currentY;
      }
    }

    fullText += pageText + '\n\n';
    onProgress?.({ currentPage: i, totalPages, stage: 'parsing' });
  }

  onProgress?.({ currentPage: totalPages, totalPages, stage: 'structuring' });

  // Apply the sectioning and token optimization heuristics
  const optimizedText = optimizeExtractedText(fullText);

  onProgress?.({ currentPage: totalPages, totalPages, stage: 'done' });
  return optimizedText;
}

/**
 * Smart heuristic to trim down paper text:
 * 1. Locate references/bibliography section and discard everything after it.
 * 2. If text is still very large, keep the head (Abstract, Intro) and tail (Results, Conclusion)
 *    and omit the middle sections to fit within token limits.
 */
function optimizeExtractedText(text: string): string {
  // 1. Cut off references
  const referenceKeywords = [
    /\n\s*references\s*\n/i,
    /\n\s*bibliography\s*\n/i,
    /\n\s*literature cited\s*\n/i,
  ];

  let cutoffIndex = -1;
  for (const regex of referenceKeywords) {
    const match = text.match(regex);
    if (match && match.index !== undefined) {
      cutoffIndex = match.index;
      break;
    }
  }

  let textWithoutReferences = text;
  if (cutoffIndex !== -1) {
    textWithoutReferences = text.substring(0, cutoffIndex);
  }

  // Trim extra spaces/newlines
  textWithoutReferences = textWithoutReferences.replace(/\s+/g, ' ').trim();

  // 2. Truncate long texts by saving the head & tail
  const MAX_CHARACTERS = 16000;
  if (textWithoutReferences.length <= MAX_CHARACTERS) {
    return textWithoutReferences;
  }

  // Keep first 9000 chars and last 6000 chars
  const headChars = 9000;
  const tailChars = 6000;

  const head = textWithoutReferences.substring(0, headChars);
  const tail = textWithoutReferences.substring(textWithoutReferences.length - tailChars);

  return `${head}\n\n[... intermediate method details and detailed derivations omitted for brevity ...]\n\n${tail}`;
}
