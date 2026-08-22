# DocuBrief — AI Document Summary Assistant & Auditor

DocuBrief is a production-quality, modern full-stack web application that processes multi-page PDF documents and images (PNG, JPG, JPEG), extracts their text, and generates structured summaries, key ideas, and gap analysis auditing reports using the Gemini AI API.

This project is built using **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS v4** to ensure speed, premium visual responsiveness, and modular maintainability.

---

## 🚀 Key Features

* **Dual-Format Document Upload**: Accepts digital PDF files and standard image formats (PNG, JPG, JPEG).
* **Multi-Channel File Pickers**: Full drag-and-drop dropzone or traditional system file picker.
* **Server-Side Extraction Pipeline**:
  * **Digital PDFs**: Extracted using the modern `pdf-parse` library, preserving structural layout.
  * **Images & Scans**: Runs optical character recognition (OCR) on image streams using `Tesseract.js` worker threads.
* **Overlong Document Chunking**: Implements a parallel map-reduce segmenting engine for texts exceeding 12,000 characters, avoiding API token boundaries.
* **Aesthetic Dashboard**: Premium indigo/pink dark-mode-first styling, featuring:
  * **Document Stats**: Displays word counts, characters, pages, and file sizes.
  * **Structured Summary**: Choose between **Short**, **Medium**, and **Long** summaries.
  * **Key Takeaways**: Styled numeric lists highlighting key arguments.
  * **Gap Auditing**: Highlights document weaknesses, vague claims, or missing sections.
  * **Searchable Reader**: Search and inspect raw extracted text.
* **Utility Actions**: Copy text sections with clipboard alerts or export briefs to formatted **Markdown (.MD)** files.
* **Graceful Failures**: Friendly error banners handling file limits, missing API keys, or scanned PDF warnings.

---

## 🛠️ Tech Stack

* **Frontend Framework**: Next.js 15.3 (React 19, TypeScript)
* **Styling Engine**: Tailwind CSS v4
* **Icons**: Lucide React
* **PDF Parser**: `pdf-parse` (Modern ESM Typescript distribution)
* **OCR Service**: `tesseract.js` (Node environment backend worker)
* **AI Summarization Model**: Google `gemini-1.5-flash` API (called via native HTTP fetch with JSON-schema enforcement)

---

## 📐 Architecture Flow

The processing logic is designed with a clean separation of concerns:

```
User Upload (Drag-and-Drop / Picker)
   ↓
File Type & Size Valdation (<10MB)
   ↓
API Route Handler (/api/process)
   ↓
MIME Dispatcher 
  ├─► PDF Parser (pdf-parse) ──► Raw Text Extracted
  └─► OCR Engine (tesseract.js) ─► OCR Text Extracted
   ↓
Content Validator (checks characters & readability)
   ↓
Summarization Layer (lib/ai.ts)
  ├─► [Optional] Document Chunking (splits texts > 12k chars into overlapping segments)
  └─► Parallel Summarization ──► Joined Text Summaries
   ↓
Final Structured Prompt Execution (Gemini JSON Schema Enforcement)
   ↓
Parsed JSON Payload
   ↓
Aesthetic Interactive Dashboard (Summary / Key Points / Gaps / Text Reader)
```

---

## 💻 Local Setup & Installation

Follow these steps to run the application locally:

### 1. Clone & Navigate
```bash
git clone <repository-url>
cd Unthinkable
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local` in the root directory:
```bash
cp .env.example .env.local
```
Open `.env.local` and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*Note: You can generate a free-tier API key in [Google AI Studio](https://aistudio.google.com/).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the application.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 🌍 Deployment

This application is ready for Vercel deployment:
1. Push the codebase to GitHub.
2. Link the repository to your Vercel Account.
3. Add `GEMINI_API_KEY` under **Environment Variables** in the Vercel Dashboard project settings.
4. Click **Deploy**. Vercel will automatically configure and build the App Router endpoints.

---

## 🛡️ Security & Validations

* **In-Memory Buffer Processing**: Files are processed directly in the server memory buffer stream. They are **never** stored permanently, preventing unauthorized file scraping or data leaks.
* **MIME Validation**: Validates file types from both extensions and content headers.
* **Protected Secrets**: API keys are isolated on the server side and never exposed to client bundles.
* **Error Sanitization**: Mask raw system stack traces from client responses to maintain codebase integrity.

---

## 💡 Future Improvements

1. **Multi-Page Image Batching**: Allow uploading multiple PNG/JPG screenshots and compiling them into a single summary document.
2. **Offline Mode**: Move OCR (Tesseract.js) and PDF.js to browser workers to parse text locally, calling server API routes only for final summarization.
3. **Citations / Source Matching**: Map key points and summary blocks directly to the source paragraph index or page number in the original PDF.
