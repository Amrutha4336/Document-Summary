'use client';

import React, { useState, useRef } from 'react';
import Header from '@/components/Header';
import DoodleUpload from '@/components/DoodleUpload';
import ProcessingLoader from '@/components/ProcessingLoader';
import SummaryLengthSelector from '@/components/SummaryLengthSelector';
import Dashboard from '@/components/Dashboard';
import { SummaryLength, SummaryResult, ProcessingStep, ProcessingError } from '@/types';
import { AlertTriangle } from 'lucide-react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [step, setStep] = useState<ProcessingStep>('idle');
  const [error, setError] = useState<ProcessingError | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setStep('idle');
    setError(null);
    setValidationError(null);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setStep('idle');
    setError(null);
    setValidationError(null);
  };

  const handleLoadSample = async () => {
    try {
      const response = await fetch('/document_sample.jpg');
      if (!response.ok) throw new Error('Sample file not found');
      const blob = await response.blob();
      const sampleFile = new File([blob], 'document_sample.jpg', { type: 'image/jpeg' });
      validateAndSelectFile(sampleFile);
    } catch (err: unknown) {
      console.error('Failed to load sample document:', err);
      setValidationError('Failed to load the sample document. Please try uploading your own.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const validateAndSelectFile = (selectedFile: File) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
    const extension = selectedFile.name.split('.').pop()?.toLowerCase();

    const isValidType = allowedTypes.includes(selectedFile.type) || allowedExtensions.includes(extension || '');
    if (!isValidType) {
      setValidationError('Unsupported file type. Please upload a PDF or an image (PNG, JPG, JPEG).');
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (selectedFile.size > MAX_FILE_SIZE) {
      setValidationError(`File is too large (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 10MB.`);
      return;
    }

    setValidationError(null);
    handleFileSelected(selectedFile);
  };

  const handleProcess = async () => {
    if (!file) return;

    setStep('uploading');
    setError(null);

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const startTime = Date.now();

    let uploadTimer: NodeJS.Timeout | undefined;
    let extractionTimer: NodeJS.Timeout | undefined;

    if (isPdf) {
      uploadTimer = setTimeout(() => {
        setStep('extracting');
      }, 1000);

      extractionTimer = setTimeout(() => {
        setStep('summarizing');
      }, 2400);
    }

    try {
      let ocrText = '';
      if (!isPdf) {
        setStep('ocr');
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();
        ocrText = text;
        setStep('summarizing');
      }

      const formData = new FormData();
      if (!isPdf) {
        formData.append('text', ocrText);
        formData.append('fileName', file.name);
        formData.append('fileSize', String(file.size));
      } else {
        formData.append('file', file);
      }
      formData.append('length', summaryLength);

      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      if (uploadTimer) clearTimeout(uploadTimer);
      if (extractionTimer) clearTimeout(extractionTimer);

      let data: {
        fileName?: string;
        fileSize?: number;
        pageCount?: number;
        wordCount?: number;
        characterCount?: number;
        extractedText?: string;
        summary?: string;
        keyPoints?: string[];
        improvementSuggestions?: string[];
        error?: string;
        isScannedPdfFallback?: boolean;
      } = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response from server:', text);
        data = { 
          error: `Server Error (${response.status}): ${text.slice(0, 120) || response.statusText || 'The server returned an empty or invalid response.'}` 
        };
      }

      const elapsed = Date.now() - startTime;
      const minLoadTime = 3200;
      if (elapsed < minLoadTime) {
        await new Promise((resolve) => setTimeout(resolve, minLoadTime - elapsed));
      }

      if (!response.ok) {
        setError({
          message: data.error || 'Failed to analyze the document.',
          isScannedPdfFallback: data.isScannedPdfFallback || false
        });
        setStep('error');
        return;
      }

      setResult(data as SummaryResult);
      setStep('success');
    } catch (err: unknown) {
      if (uploadTimer) clearTimeout(uploadTimer);
      if (extractionTimer) clearTimeout(extractionTimer);

      const elapsed = Date.now() - startTime;
      const minLoadTime = 3200;
      if (elapsed < minLoadTime) {
        await new Promise((resolve) => setTimeout(resolve, minLoadTime - elapsed));
      }

      const errMessage = err instanceof Error ? err.message : String(err);
      setError({
        message: `A network communication error occurred or the request timed out (${errMessage || 'Connection reset'}). Please verify your internet connection and try again.`
      });
      setStep('error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-neutral-900 relative selection:bg-teal-800/10 selection:text-teal-900 bg-[#fafafa]">
      <div className="grid-overlay" />

      <Header />

      {/* Hidden file input controlled by page and sub-actions */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,image/png,image/jpeg,image/jpg"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            validateAndSelectFile(e.target.files[0]);
          }
        }}
      />

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-12 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto relative z-10">

        <div className="w-full flex-1 flex flex-col justify-start mt-4">

          {/* STATE 1 — EMPTY WORKSPACE (Centered & Premium) */}
          {step === 'idle' && !file && (
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-6 duration-300">
              
              {/* Top Badge */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 border border-neutral-200/80 text-xs font-semibold text-neutral-600 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-800" />
                  <span>Dual Engine • PDF Parsing & Optical Character Recognition</span>
                </div>
              </div>

              {/* Hero Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-neutral-900 text-center max-w-3xl leading-[1.15] mb-6">
                Understand your documents.<br />
                <span className="text-teal-800">Faster.</span> Clearer. Smarter.
              </h1>

              {/* Sub-description */}
              <p className="text-sm sm:text-base text-neutral-500 text-center max-w-xl leading-relaxed mb-10">
                Upload any PDF document or scanned image to receive clear executive summaries, actionable key takeaways, and comprehensive content audit reports.
              </p>

              {/* Upload Card Container (Centered) */}
              <div className="w-full max-w-3xl mx-auto">
                <DoodleUpload
                  onFileSelected={validateAndSelectFile}
                  error={validationError}
                  setError={setValidationError}
                />
              </div>

              {/* Sample Document Option */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleLoadSample}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 underline transition-colors cursor-pointer"
                >
                  ⚡ Start with a sample document
                </button>
              </div>
            </div>
          )}

          {/* STATE 2 — FILE UPLOADED WORKSPACE (Document + controls config) */}
          {step === 'idle' && file && !result && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start w-full max-w-5xl mx-auto py-6 sm:py-10 animate-in fade-in duration-300">
              
              {/* Left Column: 01 — THE DOCUMENT */}
              <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left gap-6 border-b lg:border-b-0 lg:border-r border-neutral-200/80 pb-8 lg:pb-0 lg:pr-8 xl:pr-12">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-450 select-none">
                  01 / The Document
                </span>

                {/* Stylized Document Preview Box */}
                <div className="relative w-44 h-56 bg-white border border-neutral-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col p-4 select-none">
                  <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-2">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-500 truncate max-w-[80px]">
                      {file.name}
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-wider bg-black text-white px-1.5 py-0.5 rounded">
                      {file.name.split('.').pop()?.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-2.5 flex-1">
                    <div className="h-1.5 bg-neutral-100 rounded w-5/6" />
                    <div className="h-1.5 bg-neutral-100 rounded w-full" />
                    <div className="h-1.5 bg-neutral-100 rounded w-4/5" />
                    <div className="h-1.5 bg-neutral-100 rounded w-11/12" />
                    <div className="h-1.5 bg-neutral-100 rounded w-2/3" />
                  </div>
                </div>

                <div className="flex flex-col items-center lg:items-start">
                  <p className="text-sm font-bold text-neutral-800 break-all max-w-[280px]">
                    {file.name}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-neutral-450 uppercase tracking-widest">
                    {file.type === 'application/pdf' || file.name.endsWith('.pdf') ? 'PDF' : 'Image'} &bull; {formatFileSize(file.size)}
                  </p>
                </div>

                <button
                  onClick={handleReset}
                  className="rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 px-4 py-2 text-xs font-bold text-neutral-700 transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  Change file
                </button>
              </div>

              {/* Right Column: 02 — THE ANALYSIS */}
              <div className="lg:col-span-7 flex flex-col justify-start">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-450 select-none">
                  02 / The Analysis
                </span>

                <h3 className="mt-4 text-2xl font-bold text-neutral-900 select-none">
                  How much should we unpack?
                </h3>

                {/* Depth selector block */}
                <div className="mt-5 bg-[#fbfbfb] border border-neutral-200/80 rounded-3xl p-6 shadow-xs">
                  <div className="mt-1">
                    <SummaryLengthSelector selected={summaryLength} onChange={setSummaryLength} />
                  </div>

                  <button
                    onClick={handleProcess}
                    className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl bg-black text-white hover:bg-neutral-850 py-3.5 text-xs font-bold uppercase tracking-widest transition-all duration-200 active:scale-[0.99] cursor-pointer shadow-xs"
                  >
                    <span>Analyze document →</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* STATE 3 — PROCESSING STATE (Scanning Visual) */}
          {['uploading', 'extracting', 'ocr', 'summarizing'].includes(step) && (
            <div className="max-w-md mx-auto w-full py-8">
              <ProcessingLoader currentStep={step} file={file} />
            </div>
          )}

          {/* ERROR STATE */}
          {step === 'error' && error && (
            <div className="max-w-md mx-auto w-full rounded-3xl border border-neutral-200 bg-white p-6 shadow-md text-center animate-in fade-in zoom-in-95">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-650 border border-red-200 shadow-xs">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <h3 className="mt-4 text-xs font-bold tracking-widest uppercase text-neutral-800">Analysis Halted</h3>
              <p className="mt-3 text-xs font-semibold text-red-800 leading-relaxed">{error.message}</p>

              {error.isScannedPdfFallback && (
                <div className="mt-4 rounded-2xl bg-neutral-900 p-4 text-[10px] text-neutral-350 text-left leading-relaxed border border-neutral-800">
                  <strong className="block mb-1 text-white font-extrabold uppercase tracking-wide">🔍 Standard parser bypassed:</strong>
                  Standard text extraction only works for digital, selectable PDFs. For scanned pages or image documents, please convert them to JPG/PNG images and upload them directly to run OCR.
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleReset}
                  className="rounded-xl border border-neutral-300 bg-white hover:bg-neutral-55 px-4 py-2.5 text-xs font-bold uppercase text-neutral-700 transition-colors cursor-pointer"
                >
                  Different File
                </button>
                <button
                  onClick={handleProcess}
                  className="rounded-xl bg-black hover:bg-neutral-850 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-xs"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          )}

          {/* STATE 4 — RESULTS STATE (Editorial dashboard view) */}
          {step === 'success' && result && (
            <div className="animate-in fade-in duration-500 py-4">
              <Dashboard result={result} onReset={handleReset} />
            </div>
          )}

        </div>
      </main>

      <footer className="w-full border-t border-neutral-200 bg-white py-6 text-center text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-12 shrink-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} DocuSummary Systems. All operations compiled in-memory.</p>
        </div>
      </footer>
    </div>
  );
}

