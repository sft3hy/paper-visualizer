# 🔎 PaperLens — Research Papers, Explained Simply

**PaperLens** is a web application designed to lower the barrier to understanding cutting-edge research. It takes dense academic research papers (either uploaded locally as a PDF or found via live arXiv search) and translates them into interactive, layman-friendly visual explainers. 

The LLM (powered by **Groq Llama 3.3**) extracts structural data under a strict schema, while the frontend handles rendering deterministically to guarantee consistent layouts, clear typography, and clean visuals.

---

## ✨ Features

- **In-Browser PDF Parsing**: Text extraction happens fully client-side using `pdfjs-dist`. Large documents are optimized automatically to prioritize Abstract, Intro, and Conclusions while skipping reference pages.
- **arXiv Search**: Live, debounced search that fetches papers directly from the arXiv database, allowing you to generate explainers in one click.
- **Interactive D3 Concept Map**: Visually maps key ideas and actors from the paper into a force-directed network diagram with custom node dragging and hover highlights.
- **Simplified Timeline**: Breaks down complex methodology steps into a clean step-by-step layout.
- **Glossary & Analogy**: Decodes academic jargon into simple terms and provides a real-world analogy of the research mechanism.
- **Image Exporter**: Allows downloading the entire visual explainer as a `.png` image for easy sharing.
- **Premium Aesthetics**: Features a modern dark-mode glassmorphic theme designed with Outfit & Inter typography.

---

## 🏗️ Architecture

```
┌─────────────────────────────┐        ┌──────────────────────────────┐        ┌─────────────┐
│    React App (Vite)         │ ─────▶ │    Serverless Proxy          │ ─────▶ │  Groq API   │
│   (Hosted on GitHub Pages)  │        │ (Hosted on Cloudflare Worker)│        │  arXiv API  │
└─────────────────────────────┘  ◀───── └──────────────────────────────┘  ◀───── └─────────────┘
```

1. **Frontend (React + Vite + Tailwind CSS + D3.js)**: A static frontend hosted on **GitHub Pages**.
2. **Backend Proxy (Cloudflare Worker)**: A lightweight CORS proxy hosted on **Cloudflare Workers (free tier)**. It handles secure Groq API authentication and converts arXiv's XML/Atom search feeds into JSON.

---

## 📁 Repository Structure

```
paper-visualizer/
├── frontend/                     # React + Vite Client
│   ├── src/
│   │   ├── components/
│   │   │   ├── upload/           # Drag-drop PDF components
│   │   │   ├── search/           # arXiv Search components
│   │   │   ├── result/           # Explainer, D3 map, timeline, glossary
│   │   │   └── shared/           # Loading status stages & error screen
│   │   ├── lib/
│   │   │   ├── pdf/              # client-side pdf extraction & parser
│   │   │   ├── schema/           # Zod structures for output validation
│   │   │   └── api/              # API Client connecting to proxy worker
│   │   ├── store/                # Zustand global state manager
│   │   └── pages/                # Page controllers (Landing, Results)
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── proxy/                        # Cloudflare Worker Proxy backend
│   ├── src/
│   │   └── index.ts              # Route handling & Groq connection
│   ├── tsconfig.json
│   └── wrangler.toml
└── .github/
    └── workflows/
        └── deploy-pages.yml      # CI/CD GitHub Pages deployment
```

---

## 🚀 Getting Started (Local Development)

### 1. Backend Proxy
1. Navigate to the `proxy` folder and install dependencies:
   ```bash
   cd proxy
   npm install
   ```
2. Start the wrangler development server:
   ```bash
   npx wrangler dev
   ```
   *The proxy will run locally on `http://127.0.0.1:8787`.*

### 2. Frontend Client
1. In a new terminal window, navigate to the `frontend` folder and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client will open on `http://localhost:3000`. Vite is preconfigured to proxy `/api` calls directly to your local Wrangler server.*

---

## 🌐 Deploying to Production

### 1. Deploy the Backend Proxy
1. Deploy the Worker to Cloudflare:
   ```bash
   cd proxy
   npx wrangler deploy
   ```
2. Store your Groq API key securely as a Worker secret:
   ```bash
   npx wrangler secret put GROQ_API_KEY
   ```

### 2. Deploy the Frontend
1. Open [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) and verify that the `VITE_API_BASE_URL` environment variable points to your deployed Cloudflare Worker URL.
2. Push your changes to the `main` branch:
   ```bash
   git add .
   git commit -m "Deploy PaperLens"
   git push origin main
   ```
3. Enable GitHub Pages:
   - Go to your repository on **GitHub** &rarr; **Settings** &rarr; **Pages**.
   - Under **Build and deployment** &rarr; **Source**, select **GitHub Actions**.