import { AutoRouter, cors } from 'itty-router';
import { XMLParser } from 'fast-xml-parser';
import { z } from 'zod';

// Define the environment bindings type
interface Env {
  GROQ_API_KEY?: string;
  ALLOWED_ORIGIN?: string;
}

// Zod Schema to validate LLM output structure
const ExplainerSchema = z.object({
  title_plain: z.string().max(150),
  tldr: z.string().max(350),
  big_picture: z.string().max(700),
  key_findings: z.array(
    z.object({
      finding: z.string().max(250),
      why_it_matters: z.string().max(250),
    })
  ).min(2).max(6),
  method_simplified: z.array(
    z.object({
      step_title: z.string().max(80),
      step_description: z.string().max(250),
    })
  ).min(2).max(6),
  glossary: z.array(
    z.object({
      term: z.string().max(50),
      definition: z.string().max(200),
    })
  ).max(10),
  real_world_analogy: z.string().max(450),
  limitations: z.array(z.string().max(200)).max(5),
  concept_map_nodes: z.array(
    z.object({
      id: z.string(),
      label: z.string().max(50),
    })
  ).min(2).max(10),
  concept_map_edges: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      label: z.string().max(40).optional(),
    })
  ).min(1).max(15),
});

// Setup Router with built-in CORS handler
const { preflight, corsify } = cors({
  origin: (origin) => {
    // If ALLOWED_ORIGIN is explicitly set, use it.
    // Otherwise, allow localhost (development) and github.io (production).
    if (!origin) return;
    const url = new URL(origin);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname.endsWith('.github.io')) {
      return origin;
    }
    return;
  },
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
});

const router = AutoRouter<any, [Env, any]>();

// Preflight handler
router.all('*', preflight);

// Health check endpoint
router.get('/api/health', () => {
  return new Response(JSON.stringify({ status: 'ok', time: new Date().toISOString() }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// arXiv Search API Proxy
router.get('/api/arxiv/search', async (request, env) => {
  const { q, start = '0', max_results = '10' } = request.query;

  if (!q) {
    return new Response(JSON.stringify({ error: 'Missing query parameter "q"' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const arxivUrl = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(q)}&start=${start}&max_results=${max_results}`;

  try {
    const response = await fetch(arxivUrl);
    if (!response.ok) {
      throw new Error(`arXiv API responded with status ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    const parsedXml = parser.parse(xmlText);
    const feed = parsedXml?.feed;
    if (!feed) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Standardize results. Feed entries can be a single object or an array of objects
    let entries = feed.entry || [];
    if (!Array.isArray(entries)) {
      entries = [entries];
    }

    const results = entries.map((entry: any) => {
      const idUrl = entry.id || '';
      const arxivId = idUrl.split('/abs/').pop() || idUrl;

      // Extract authors
      let authors: string[] = [];
      if (entry.author) {
        const rawAuthors = Array.isArray(entry.author) ? entry.author : [entry.author];
        authors = rawAuthors.map((a: any) => a.name).filter(Boolean);
      }

      // Extract links
      let pdfUrl = '';
      let webUrl = idUrl;
      if (entry.link) {
        const links = Array.isArray(entry.link) ? entry.link : [entry.link];
        const pdfLink = links.find((l: any) => l['@_title'] === 'pdf' || l['@_type'] === 'application/pdf');
        if (pdfLink) {
          pdfUrl = pdfLink['@_href'] || '';
        } else {
          // Fallback PDF URL
          pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
        }
        const webLink = links.find((l: any) => l['@_rel'] === 'alternate');
        if (webLink) {
          webUrl = webLink['@_href'] || idUrl;
        }
      }

      // Clean title (remove linebreaks and extra spaces)
      const cleanTitle = (entry.title || '').replace(/\s+/g, ' ').trim();
      const cleanSummary = (entry.summary || '').replace(/\s+/g, ' ').trim();

      return {
        id: arxivId,
        title: cleanTitle,
        summary: cleanSummary,
        published: entry.published || '',
        updated: entry.updated || '',
        authors,
        pdfUrl,
        webUrl,
      };
    });

    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Groq Explainer Generator endpoint
router.post('/api/generate', async (request, env) => {
  if (!env.GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: 'Groq API Key is not configured on the server.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { text?: string; title?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { text, title } = body;
  if (!text || text.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'Missing paper text in "text" field' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Truncate text client-side or server-side to fit token budget (roughly ~15000 characters)
  const truncatedText = text.substring(0, 18000);

  const systemPrompt = `You are a world-class science communicator and research analyst.
Your task is to read the provided text from a research paper (titled: "${title || 'Unknown'}") and explain it simply to an intelligent layperson.
Avoid academic jargon. If you must introduce a technical term, you MUST include it in the glossary.
Your response MUST be a single, valid JSON object that matches the following TypeScript structure:
{
  "title_plain": "A simplified, highly engaging title capturing what this paper actually accomplished (max 120 chars)",
  "tldr": "A 1-paragraph summary explaining the core breakthrough and its significance in very simple, jargon-free words (max 280 chars)",
  "big_picture": "Why does this research exist? Explain the real-world problem or mystery this research tries to solve, and why previous attempts failed (max 600 chars)",
  "key_findings": [
    {
      "finding": "Clear summary of a core result, number, or discovery (max 200 chars)",
      "why_it_matters": "Why this specific finding is important for the field or real world (max 200 chars)"
    }
  ], // (Provide between 3 and 5 findings)
  "method_simplified": [
    {
      "step_title": "Short title of the step (max 60 chars)",
      "step_description": "Very simple explanation of what the researchers did in this step (max 220 chars)"
    }
  ], // (Provide between 3 and 5 steps in order)
  "glossary": [
    {
      "term": "The technical term used",
      "definition": "A clear, intuitive definition using everyday analogies where possible (max 160 chars)"
    }
  ], // (Provide between 3 and 8 terms)
  "real_world_analogy": "An elegant, intuitive analogy comparing this research, mechanism, or solution to something familiar in everyday life (max 400 chars)",
  "limitations": [
    "A limitation, caveat, or future research scope mentioned by the authors (max 160 chars)"
  ], // (Provide between 2 and 4 limitations)
  "concept_map_nodes": [
    { "id": "A unique, simple string ID (e.g. 'model', 'data', 'training')", "label": "Short noun label for this concept (max 40 chars)" }
  ], // (Provide between 4 and 8 nodes representing key concepts)
  "concept_map_edges": [
    { "from": "node_id_1", "to": "node_id_2", "label": "Relationship verb or short phrase (max 30 chars)" }
  ] // (Provide between 4 and 10 edges linking the node IDs above)
}

Strict requirements:
1. Only reference facts mentioned in or reasonably inferred from the source text. Do not invent any details.
2. The concept map edges MUST only connect valid node IDs that exist in the concept_map_nodes list.
3. Every key in the JSON object must be populated.
4. Output ONLY the JSON block. Do not wrap in markdown tags like \`\`\`json. Output must be a pure JSON string.`;

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Here is the research paper text:\n\n${truncatedText}` },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!groqResponse.ok) {
      const errBody = await groqResponse.text();
      throw new Error(`Groq API responded with status ${groqResponse.status}: ${errBody}`);
    }

    const groqData: any = await groqResponse.json();
    const rawContent = groqData.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error('Groq returned an empty response.');
    }

    const parsedJson = JSON.parse(rawContent.trim());

    // Validate schema
    const validationResult = ExplainerSchema.safeParse(parsedJson);
    if (!validationResult.success) {
      // Return details of what failed validation for easier debugging
      return new Response(
        JSON.stringify({
          error: 'LLM output failed validation schema',
          issues: validationResult.error.issues,
          rawOutput: parsedJson,
        }),
        {
          status: 422,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify(validationResult.data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Error communicating with Groq API' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Default 404
router.all('*', () => new Response('Not Found', { status: 404 }));

export default {
  fetch: (request: Request, env: Env, ctx: any) =>
    router.fetch(request, env, ctx).then(corsify),
};
