import { ExplainerSchema, type ExplainerData } from '../schema/explainer';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '';

export interface ArxivPaper {
  id: string;
  title: string;
  summary: string;
  published: string;
  updated: string;
  authors: string[];
  pdfUrl: string;
  webUrl: string;
}

export async function searchArxiv(query: string): Promise<ArxivPaper[]> {
  const url = `${API_BASE_URL}/api/arxiv/search?q=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `arXiv search failed with status ${response.status}`);
  }
  const data = await response.json();
  return data.results || [];
}

export async function generateExplainer(text: string, title?: string): Promise<ExplainerData> {
  const url = `${API_BASE_URL}/api/generate`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, title }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 422) {
      console.error('LLM generated output validation errors:', errorData.issues);
      throw new Error('The AI model generated an output that does not match our structured formatting rules. Please try again.');
    }
    throw new Error(errorData.error || `Explainer generation failed with status ${response.status}`);
  }

  const rawData = await response.json();
  // Safe parse client side too
  const result = ExplainerSchema.safeParse(rawData);
  if (!result.success) {
    console.error('Client validation failed:', result.error.issues);
    throw new Error('Data validation error: The server returned an invalid explainer structure.');
  }

  return result.data;
}
