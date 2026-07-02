# Implementation Plan: "PaperLens" — Research Papers, Explained Simply

## 1. Product Summary

A web app that takes a research paper — either dragged in as a PDF or found via an
arXiv search — and produces a clean, visual, layman-friendly explainer: plain-language
summary, key findings, a simplified methodology breakdown, a glossary, and a diagram
of how the pieces fit together. The LLM (via Groq) only fills in *content*; the
*layout and structure* are deterministic templates, so output quality never depends
on the model "designing" anything.

**Goal:** lower the barrier to understanding cutting-edge research for a general
audience, without requiring domain expertise to parse dense academic writing.

---

## 2. Key Architectural Decision (read this first)

You asked for a "React/Node native web app hosted on GitHub Pages." One important
constraint: **GitHub Pages only serves static files — it cannot run a Node backend.**
Since this app needs to (a) call the Groq API without exposing your API key in the
browser, and (b) query arXiv's API (which does not send CORS headers, so browsers
will block direct client-side requests), we need a *thin* backend somewhere.

**Recommendation:** Keep the frontend as a pure static React app on GitHub Pages, and
add a minimal serverless proxy layer (Cloudflare Workers, free tier, or Vercel/Netlify
Functions) that does two things only:
1. Proxies arXiv API requests (adds CORS headers, returns JSON instead of XML).
2. Proxies Groq API calls (keeps your Groq key server-side, adds rate limiting).

This preserves the "static site on GitHub Pages" deployment you asked for, while
being realistic about what's possible without a real backend server. Everything else
in this plan (React app, UI, PDF parsing, drag & drop) runs fully client-side.

```
┌─────────────────────┐        ┌──────────────────────┐        ┌────────────┐
│  React App (GH Pages)│ ─────▶ │ Serverless Proxy      │ ─────▶ │ Groq API   │
│  static, client-side  │        │ (Cloudflare Worker)   │        │ arXiv API  │
└─────────────────────┘  ◀───── └──────────────────────┘  ◀───── └────────────┘
```

---

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Build tool | **Vite** + React + TypeScript | Fast dev server, trivial static export for GH Pages |
| Styling | **Tailwind CSS** + **shadcn/ui** | Modern, accessible components, fast to theme |
| Animation | **Framer Motion** | Smooth page/section transitions, drag feedback |
| Drag & drop | **react-dropzone** | Battle-tested, accessible, handles file validation |
| PDF text extraction | **pdfjs-dist** (PDF.js) | Runs entirely client-side, no upload needed for parsing |
| Diagrams/visuals | **D3.js** for custom diagrams, **Recharts** for any chart-like data | D3 for the bespoke "concept map" visual, Recharts if paper has numeric results worth graphing |
| State management | **Zustand** | Lightweight, no boilerplate, fine for this app's scope |
| Data fetching/caching | **TanStack Query (React Query)** | Caching, loading/error states for API calls |
| Schema validation | **Zod** | Validates LLM JSON output against a strict schema before rendering |
| Routing | **React Router** | Landing → Search/Upload → Result view |
| Backend proxy | **Cloudflare Workers** (or Vercel Edge Functions) | Free tier, globally distributed, minimal cold start |
| LLM provider | **Groq API** (Llama 4, JSON mode) | Fast inference, cheap, supports structured/JSON output |
| Hosting (frontend) | **GitHub Pages** via GitHub Actions | As specified |
| Hosting (proxy) | Cloudflare Workers free tier | Separate deploy, effectively free at this scale |

---

## 4. The Deterministic Template System (core design principle)

This is the piece that keeps quality consistent regardless of LLM output variance.

### 4.1 Fixed Output Schema
Define a strict Zod schema that the LLM must fill. Example shape:

```ts
const PaperExplainerSchema = z.object({
  title_plain: z.string().max(120),        // "what this paper is really about" title
  tldr: z.string().max(280),                // one-paragraph plain summary
  big_picture: z.string().max(600),         // why this research exists / what problem it solves
  key_findings: z.array(z.object({
    finding: z.string().max(200),
    why_it_matters: z.string().max(200),
  })).min(2).max(5),
  method_simplified: z.array(z.object({
    step_title: z.string().max(60),
    step_description: z.string().max(220),
  })).min(2).max(6),
  glossary: z.array(z.object({
    term: z.string().max(40),
    definition: z.string().max(160),
  })).max(10),
  real_world_analogy: z.string().max(400),
  limitations: z.array(z.string().max(160)).max(4),
  concept_map_nodes: z.array(z.object({
    id: z.string(),
    label: z.string().max(40),
  })).max(8),
  concept_map_edges: z.array(z.object({
    from: z.string(),
    to: z.string(),
    label: z.string().max(30).optional(),
  })).max(12),
});
```

### 4.2 Why this works
- The **React components are pre-built** (SummaryCard, FindingsList, StepTimeline,
  GlossaryGrid, ConceptMapDiagram, etc.) — the LLM never generates markup, CSS, or
  layout, only short strings that slot into fixed positions.
- **Field-level length caps** prevent runaway text from breaking layouts.
- **Zod validation with retry**: if the LLM response fails schema validation, retry
  once with a corrective system message ("Your last response didn't match the
  required JSON schema, here's what was wrong: ..."); after 2 failures, fall back to
  a graceful error state with a "regenerate" button.
- **Groq JSON mode / tool-calling** is used to constrain output format at the model
  level, reducing malformed responses before they even hit validation.
- The **concept map** (nodes/edges) is rendered deterministically with D3 — the LLM
  only supplies labels and relationships, not positions or styling; a force-directed
  or fixed hierarchical layout algorithm handles the actual visual placement.

### 4.3 Prompt structure
- System prompt fixes the schema, tone ("explain like I'm a smart adult with no
  background in this field"), and hard constraints (no jargon without a glossary
  entry, no invented facts not in the source text).
- User message = extracted paper text (chunked/truncated to fit context, prioritizing
  abstract, intro, results, and conclusion sections — see §5.3).
- Temperature kept low (e.g., 0.3–0.4) to favor consistency over creativity.

---

## 5. Core Features & User Flow

### 5.1 Landing Page
- Prominent **drag-and-drop zone** (react-dropzone) — "Drop a PDF here, or..."
- **Search bar** below/beside it — "...search arXiv" with live-ish debounced
  autocomplete showing paper title, authors, date, abstract snippet.
- Recent/trending arXiv papers shown as suggestion chips (optional nice-to-have,
  pulled from arXiv's recent listings).

### 5.2 ArXiv Search
- User types a query → debounced request to the proxy → proxy hits
  `export.arxiv.org/api/query` → converts Atom/XML to JSON → returns to client.
- Results rendered as cards (title, authors, abstract excerpt, published date,
  category tags). Clicking a result fetches the PDF link directly from arXiv
  (arXiv PDFs are typically CORS-friendly) or via the proxy if needed.

### 5.3 PDF Ingestion & Text Extraction
- Whether from drag-drop or arXiv selection, the PDF is loaded via `pdfjs-dist`
  **entirely in the browser** — no need to upload the file itself to any server.
- Extract text per page, then apply a lightweight heuristic to identify and
  prioritize: Abstract, Introduction, Results/Findings, Conclusion (skip
  References, Acknowledgments). This keeps the payload sent to Groq small and
  focused, which matters for both cost and context window limits.
- Show a progress indicator during extraction ("Reading paper...", "Finding key
  sections...").

### 5.4 Generation & Loading State
- Extracted + trimmed text is POSTed to the proxy, which calls Groq with the
  fixed system prompt + schema.
- Frontend shows a tasteful multi-stage loading animation (e.g., "Analyzing
  structure → Extracting findings → Building visuals") using Framer Motion,
  even though under the hood it's a single API call — this manages perceived
  wait time honestly without lying about progress granularity.

### 5.5 Result View
- Renders the deterministic template components in a scroll-driven layout:
  1. Hero section: plain-language title + TL;DR
  2. "The Big Picture" narrative block
  3. Key Findings (card grid, icon + finding + why it matters)
  4. Simplified Methodology (horizontal/vertical step timeline)
  5. Concept Map (interactive D3 diagram, pan/zoom)
  6. Real-world analogy callout box
  7. Glossary (expandable grid/accordion)
  8. Limitations (subtle, collapsed by default)
  9. Link back to original PDF / arXiv abstract page
- Export/share options: "Copy link", "Download as image" (via `html-to-image` or
  similar), maybe a "Regenerate" button if the user wants another pass.

### 5.6 Error & Edge Cases
- Non-PDF file dropped → inline validation message.
- PDF too large / scanned image-only PDF with no extractable text → clear error
  with suggestion.
- arXiv search returns nothing → empty state with query tips.
- Groq API failure/timeout → retry button, don't lose extracted text (keep in
  Zustand store so user doesn't have to re-upload).

---

## 6. Project Structure

```
paperlens/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── upload/          # Dropzone, FileValidation
│   │   │   ├── search/          # SearchBar, ArxivResultCard
│   │   │   ├── result/          # SummaryCard, FindingsList, StepTimeline,
│   │   │   │                      GlossaryGrid, ConceptMapDiagram, AnalogyBox
│   │   │   └── shared/          # LoadingStages, ErrorState, Layout
│   │   ├── lib/
│   │   │   ├── pdf/             # pdf.js extraction + section heuristics
│   │   │   ├── schema/          # Zod schemas
│   │   │   └── api/             # client for calling the proxy
│   │   ├── store/               # Zustand stores
│   │   ├── pages/               # Landing, Result, NotFound
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── proxy/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── arxiv-search.ts
│   │   │   └── generate-explainer.ts
│   │   ├── lib/
│   │   │   ├── groq-client.ts
│   │   │   ├── arxiv-client.ts
│   │   │   └── prompt-templates.ts
│   │   └── index.ts
│   └── wrangler.toml            # Cloudflare Workers config
├── .github/
│   └── workflows/
│       └── deploy-pages.yml
└── README.md
```

---

## 7. Deployment

### Frontend → GitHub Pages
- GitHub Actions workflow: on push to `main`, run `npm run build` in `frontend/`,
  then deploy `dist/` to the `gh-pages` branch (or use the official
  `actions/deploy-pages` action with Pages configured for "GitHub Actions" source).
- Set `base` in `vite.config.ts` to match the repo name (e.g.,
  `/paperlens/`) so asset paths resolve correctly under
  `https://<username>.github.io/paperlens/`.
- Store the proxy's base URL as a build-time env var (`VITE_API_BASE_URL`) so the
  frontend knows where to send requests.

### Proxy → Cloudflare Workers
- Separate deploy via `wrangler deploy`, can be wired into the same GitHub Actions
  workflow as a second job, triggered only when `proxy/` changes.
- Groq API key stored as a Cloudflare secret (`wrangler secret put GROQ_API_KEY`),
  never in source control or the client bundle.
- CORS configured on the Worker to only allow your GitHub Pages origin.

---

## 8. Security & Cost Controls

- **API key isolation**: Groq key lives only in the Worker's secret store.
- **Rate limiting**: basic per-IP rate limit on the proxy (Cloudflare has built-in
  tools for this, or a simple in-memory/KV counter) to prevent abuse driving up
  your Groq bill.
- **Input caps**: truncate extracted paper text to a safe token budget before
  sending to Groq; reject PDFs above a size threshold (e.g., 25MB) client-side.
- **Output caps**: schema field length limits (see §4.1) double as a cost control,
  since they bound `max_tokens` needed for generation.
- **No PII/file storage**: nothing is persisted server-side by default — PDFs are
  processed in-browser and paper text is only relayed transiently through the proxy.

---

## 9. Suggested Build Phases

**Phase 1 — Foundation**
Vite/React/Tailwind scaffold, GitHub Pages deploy pipeline working end-to-end with
a placeholder page. Cloudflare Worker scaffold with a health-check route.

**Phase 2 — Ingestion**
Drag-and-drop + PDF.js extraction working locally (console-log extracted text).
ArXiv search proxy route + basic search UI.

**Phase 3 — LLM Pipeline**
Zod schema finalized, Groq prompt built, `/generate-explainer` proxy route working
against real extracted text, validated end-to-end with `curl`/Postman before wiring
to UI.

**Phase 4 — Result UI**
Build the deterministic template components against mock schema data first (so UI
work isn't blocked by LLM latency), then wire to real API responses.

**Phase 5 — Polish**
Loading-stage animations, concept map D3 interactivity, error states, share/export,
responsive/mobile pass, accessibility pass (keyboard nav for dropzone/search).

**Phase 6 — Hardening**
Rate limiting, size limits, retry/fallback logic for malformed LLM output, basic
analytics (optional), final deploy.

---

## 10. Open Questions to Resolve Before Building

- Which Groq model specifically (e.g., `meta-llama/llama-4-scout-17b-16e-instruct`) — worth checking
  current Groq model lineup and pricing at build time, as this changes often.
- Should generated explainers be cacheable/shareable (e.g., cache by arXiv ID in
  Workers KV so re-visits/shares don't re-hit the LLM)? Recommended as a fast
  follow — cheap to add given the proxy architecture already exists.
- Any desired support for non-arXiv PDFs with no canonical URL for sharing —
  probably fine to just support local re-generation only for those.