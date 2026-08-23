# DocuBrief — AI Document Summary Assistant & Auditor

DocuBrief is a production-grade, highly optimized full-stack web application built to process multi-page PDF documents and images (PNG, JPG, JPEG), extract their text contents, and generate beautiful structured summaries, key takeaways, and gap-analysis audit reports using the Google Gemini 2.5 Flash API.

This project is built using **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4** to ensure blazing-fast performance, premium dark-mode aesthetics, and modular maintainability.

---

## 🚀 Key Features

* **Dual-Format Document Upload**: Seamlessly processes digital PDF files as well as standard images (PNG, JPG, JPEG).
* **Multi-Channel File Uploads**: Drag-and-drop dropzone or traditional system file picker with instant file metadata preview.
* **Serverless-Optimized Parsing Pipeline**:
  * **Digital PDFs**: Extracted using `unpdf` (a modern serverless-friendly wrapper around `pdfjs-dist`), avoiding serverless environment crashes.
  * **Scanned Images & Layouts**: Runs Optical Character Recognition (OCR) on image buffers using `Tesseract.js` worker threads.
* **Overlong Document Chunking**: Implements a robust map-reduce chunking strategy for text blocks exceeding 12,000 characters to process long documents without exceeding LLM context limits.
* **Aesthetic & Responsive Dashboard**: Premium indigo/pink dark-mode-first layout, featuring:
  * **Document Statistics**: Real-time display of page count, word count, character count, and file size.
  * **Summary Length Customization**: Choose between **Short** (2-3 sentences), **Medium** (2-3 paragraphs), and **Long** (4+ paragraphs) summaries.
  * **Key Takeaways**: High-priority takeaways rendered as a styled, clean ordered list.
  * **Auditing / Gap Analysis**: Actionable recommendations highlighting logical gaps, vague statements, missing details, or improvements.
  * **Raw Text Reader**: A fully searchable, scrollable drawer to inspect the raw extracted text.
* **Utility & Export Controls**: Copy generated summaries with local clipboard state alerts, or export the audit briefs directly to formatted **Markdown (.MD)** files.
* **Resilient Error Architecture**: Provides graceful, user-friendly fallback banners for file size violations, unsupported mime-types, scanned PDF fallbacks (prompting image uploads), missing API keys, or upstream gateway timeouts.

---

## 🛠️ Tech Stack

* **Core Framework**: [Next.js 16.3](https://nextjs.org/) (React 19, App Router, TypeScript)
* **Styling Engine**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **PDF Extraction**: [unpdf](https://github.com/unjs/unpdf) (configured as a server external package to allow dynamic bundling)
* **OCR Service**: [Tesseract.js](https://tesseract.projectnaptha.com/)
* **AI Provider**: Google [Gemini 2.5 Flash](https://ai.google.dev/) API (integrated via direct HTTPS fetch using native REST endpoints and strict JSON Schema structures)

---

## 📐 Pipeline & Processing Architecture

The document extraction and audit pipeline is decoupled for clean separation of concerns:

```
User Selects File (Drag-and-Drop or Picker)
         │
         ▼
Validate File Type & Size (<10MB limit)
         │
         ▼
POST Request to /api/process (NextJS API Route)
         │
         ├──────────────────────────────────────────┐
         ▼ (application/pdf)                        ▼ (image/*)
   unpdf Extraction Engine                  Tesseract.js OCR
         │                                          │
         └───────────────────┬──────────────────────┘
                             ▼
                 Raw Text Extracted & Sanitized
                             │
                             ▼
                    Size Validation Check
                             │
     ┌───────────────────────┴───────────────────────┐
     ▼ (Text Length <= 12k chars)                    ▼ (Text Length > 12k chars)
Send directly to Structured Schema API         Chunk text into 10k overlapping blocks
                             │                       │
                             │                       ▼
                             │                 Summarize chunks in parallel
                             │                       │
                             │                       ▼
                             │                 Merge summaries into unified prompt
                             │                       │
                             ▼                       ▼
     └───────────────────────┬───────────────────────┘
                             ▼
             Gemini 2.5 Flash API Execution
           (Strict JSON Response Schema Enforcement)
                             │
                             ▼
                     Parsed JSON Result
  { summary: string, keyPoints: string[], improvementSuggestions: string[] }
                             │
                             ▼
              Interactive Auditing Dashboard
```

---

## 💻 Local Setup & Installation

### 1. Clone & Navigate
```bash
git clone https://github.com/Yaswanth-Krishna17/Document-Summary.git
cd Document-Summary
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root of the project:
```bash
cp .env.example .env.local
```
Configure your Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note**: You can obtain a free-tier Gemini API key from [Google AI Studio](https://aistudio.google.com/).

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 5. Production Build
To generate and verify a production build locally:
```bash
npm run build
npm run start
```

---

## ⚙️ Serverless & Environment Adaptations

To ensure seamless execution on serverless platforms (e.g., Netlify, Vercel), the codebase incorporates the following adaptations:

* **Next.js Bundler Configuration**: In `next.config.ts`, `pdfjs-dist` is declared under `serverExternalPackages` to prevent next-swc/webpack compilation crashes during build-time packaging.
* **Cache Cleanups**: A custom postbuild script (`scripts/cleanup-cache.js`) automatically runs after `next build` to clear build caches and prevent secrets-scanning false positives or deployment footprint bloat.
* **Buffer-Only Storage**: Raw files are parsed directly from multi-part form data in server memory buffers. No local disk writes are executed, maintaining security and stateless serverless compatibility.

---

## 🛡️ Validation & Error Mitigation

* **Empty/Scanned PDF Fallback**: If a PDF is parsed and yields no text contents, the API returns a `422 Unprocessable Entity` status code indicating the PDF is likely scanned, recommending the user to upload high-contrast PNG/JPG exports of the document pages.
* **Sanitized Logs**: Backend console traces are preserved for developer debugging, while sanitizing client-bound exceptions to guard backend environment metadata.
* **Dynamic Loading Indicators**: Skeletons and progress stages are rendered with accurate indicators to manage user expectations during longer OCR processes.

---

## 💡 Future Enhancements

1. **Multi-Page OCR Stitching**: Support compiling multiple uploaded screenshots/scans into a single document summary.
2. **Dynamic Client OCR**: Move Tesseract.js initialization to a client-side Web Worker to perform OCR locally, calling the API route only for final Gemini structured analysis.
3. **Citations Mapping**: Auto-highlight parts of the raw text containing source facts matching the generated key takeaways.
