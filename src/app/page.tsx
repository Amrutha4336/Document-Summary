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
    <div className="flex flex-col min-h-screen font-sans text-[#111814] relative selection:bg-[#111814]/15 selection:text-[#111814]">
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

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-8 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto relative z-10">

        <div className="w-full flex-1 flex flex-col justify-start mt-4 sm:mt-8">

          {/* STATE 1 — EMPTY WORKSPACE (Asymmetrical & Editorial) */}
          {step === 'idle' && !file && (
            <div className="w-full max-w-5xl mx-auto flex flex-col gap-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-center py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-6 duration-300">
                
                {/* Left Editorial Section */}
                <div className="lg:col-span-7 flex flex-col text-left">
                  <h2 className="font-display text-6xl sm:text-7xl lg:text-8xl font-normal tracking-tight leading-none text-[#111814] uppercase">
                    MAKE YOUR <br />
                    DOCUMENTS <br />
                    SPEAK.
                  </h2>
                  
                  <p className="mt-6 text-sm sm:text-base text-[#111814]/75 font-semibold leading-relaxed max-w-md">
                    Drop a document worth understanding. Or start by{' '}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="underline font-black text-[#111814] hover:text-black cursor-pointer bg-transparent border-0 p-0 inline-block focus:outline-none"
                    >
                      browsing your files
                    </button>.
                  </p>

                  <div className="mt-5">
                    <button
                      onClick={handleLoadSample}
                      style={{
                        boxShadow: '2px 2px 0 rgba(17, 24, 20, 0.8)',
                        border: '2px solid #111814'
                      }}
                      className="text-xs font-black uppercase tracking-wider text-[#111814] bg-white rounded-xl px-4 py-2.5 cursor-pointer hover:bg-neutral-100 transition-all duration-200 active:scale-[0.98]"
                    >
                      ⚡ Load Sample Document
                    </button>
                  </div>

                  <div className="mt-8 flex items-center gap-2.5 text-[9px] font-black tracking-widest text-[#111814]/40 uppercase">
                    <span>PDF</span>
                    <span>&bull;</span>
                    <span>JPG</span>
                    <span>&bull;</span>
                    <span>PNG</span>
                    <span>&bull;</span>
                    <span>OCR Parser</span>
                  </div>
                </div>

                {/* Right Interactive Ingestion Section (Desk/Visual Mat) */}
                <div className="lg:col-span-5 flex items-center justify-center relative py-12">
                  
                  {/* Overlapping page graphics behind Doodle folder */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    {/* Page sheet 1 */}
                    <div className="w-40 h-52 bg-white/50 border border-[#111814]/15 rounded-xl shadow-md rotate-[-8deg] -translate-x-8 -translate-y-4" />
                    {/* Page sheet 2 */}
                    <div className="w-40 h-52 bg-white/75 border border-[#111814]/15 rounded-xl shadow-md rotate-[6deg] translate-x-6 translate-y-2" />
                  </div>

                  {/* Lime Crush active workspace block */}
                  <div className="relative z-10 w-full max-w-[280px] bg-gradient-to-tr from-[#F9F586] to-[#A1FFCE] border-2 border-[#111814] rounded-3xl p-8 shadow-xl hover:translate-y-[-2px] transition-transform duration-300">
                    <DoodleUpload
                      onFileSelected={validateAndSelectFile}
                      error={validationError}
                      setError={setValidationError}
                    />
                  </div>
                </div>
              </div>

              {/* Editorial feature grid strip (Typography based, no cards) */}
              <div className="w-full border-t border-[#111814]/10 pt-12 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-left select-none">
                <div>
                  <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">01 / PARSER</span>
                  <h4 className="text-sm font-black text-[#111814] uppercase tracking-wider">Digital Parsing</h4>
                  <p className="mt-2 text-xs text-[#111814]/75 leading-relaxed font-bold">Extracts content, preserving paragraphs and structural formatting.</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">02 / INSIGHTS</span>
                  <h4 className="text-sm font-black text-[#111814] uppercase tracking-wider">Smart Summary</h4>
                  <p className="mt-2 text-xs text-[#111814]/75 leading-relaxed font-bold">Converts documents into customized, structured reading briefs.</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">03 / AUDIT</span>
                  <h4 className="text-sm font-black text-[#111814] uppercase tracking-wider">Structural Audit</h4>
                  <p className="mt-2 text-xs text-[#111814]/75 leading-relaxed font-bold">Identifies logical leaks, missing sections, and weaker content blocks.</p>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2 — FILE UPLOADED WORKSPACE (Document + controls config) */}
          {step === 'idle' && file && !result && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start w-full max-w-5xl mx-auto py-6 sm:py-10 animate-in fade-in duration-300">
              
              {/* Left Column: 01 — THE DOCUMENT */}
              <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left gap-6 border-b lg:border-b-0 lg:border-r border-[#111814]/10 pb-8 lg:pb-0 lg:pr-8 xl:pr-12">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#111814]/50 select-none">
                  01 / The Document
                </span>

                {/* Stylized Document Preview Box */}
                <div className="relative w-44 h-56 bg-white border-2 border-[#111814] rounded-2xl shadow-xl overflow-hidden flex flex-col p-4 select-none">
                  <div className="flex items-center justify-between mb-4 border-b border-[#111814]/10 pb-2">
                    <span className="text-[8px] font-black uppercase tracking-wider text-[#111814]/60 truncate max-w-[80px]">
                      {file.name}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-wider bg-[#111814] text-white px-1.5 py-0.5 rounded">
                      {file.name.split('.').pop()?.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-2.5 flex-1">
                    <div className="h-1.5 bg-[#111814]/10 rounded w-5/6" />
                    <div className="h-1.5 bg-[#111814]/10 rounded w-full" />
                    <div className="h-1.5 bg-[#111814]/10 rounded w-4/5" />
                    <div className="h-1.5 bg-[#111814]/10 rounded w-11/12" />
                    <div className="h-1.5 bg-[#111814]/10 rounded w-2/3" />
                  </div>
                </div>

                <div className="flex flex-col items-center lg:items-start">
                  <p className="text-sm font-black text-[#111814] break-all max-w-[280px]">
                    {file.name}
                  </p>
                  <p className="mt-1 text-[10px] font-black text-[#111814]/60 uppercase tracking-widest">
                    {file.type === 'application/pdf' || file.name.endsWith('.pdf') ? 'PDF' : 'Image'} &bull; {formatFileSize(file.size)}
                  </p>
                </div>

                <button
                  onClick={handleReset}
                  className="rounded-xl border-2 border-[#111814] bg-white/50 px-4 py-2.5 text-xs font-black uppercase text-[#111814] hover:bg-white transition-all cursor-pointer shadow-sm active:scale-98"
                >
                  Change file
                </button>
              </div>

              {/* Right Column: 02 — THE ANALYSIS */}
              <div className="lg:col-span-7 flex flex-col justify-start">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#111814]/50 select-none">
                  02 / The Analysis
                </span>

                <h3 className="mt-4 font-display text-3xl text-[#111814] uppercase select-none">
                  How much should we unpack?
                </h3>

                {/* Depth selector block inside Lime Crush block */}
                <div className="mt-5 bg-gradient-to-tr from-[#F9F586] to-[#A1FFCE] border-2 border-[#111814] rounded-3xl p-6 shadow-md">
                  <div className="mt-1">
                    <SummaryLengthSelector selected={summaryLength} onChange={setSummaryLength} />
                  </div>

                  <button
                    onClick={handleProcess}
                    style={{
                      boxShadow: '4px 4px 0 rgba(17, 24, 20, 0.8)',
                      border: '2px solid #111814'
                    }}
                    className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl bg-[#111814] text-white py-3.5 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.99] hover:bg-gradient-to-r hover:from-[#F9F586] hover:to-[#A1FFCE] hover:text-[#111814] cursor-pointer"
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
            <div className="max-w-md mx-auto w-full rounded-3xl border-2 border-[#111814] bg-white/80 p-6 shadow-xl text-center animate-in fade-in zoom-in-95">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 border border-red-600 shadow-sm">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <h3 className="mt-4 text-xs font-black tracking-widest uppercase text-[#111814]">Analysis Halted</h3>
              <p className="mt-3 text-xs font-bold text-red-700 leading-relaxed">{error.message}</p>

              {error.isScannedPdfFallback && (
                <div className="mt-4 rounded-2xl bg-neutral-950 p-4 text-[10px] text-[#F9F586] text-left leading-relaxed border border-neutral-800">
                  <strong className="block mb-1 text-white font-extrabold uppercase tracking-wide">🔍 Standard parser bypassed:</strong>
                  Standard text extraction only works for digital, selectable PDFs. For scanned pages or image documents, please convert them to JPG/PNG images and upload them directly to run OCR.
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleReset}
                  className="rounded-xl border-2 border-[#111814] bg-white/50 px-4 py-2.5 text-xs font-black uppercase text-[#111814] hover:bg-white transition-colors cursor-pointer"
                >
                  Different File
                </button>
                <button
                  onClick={handleProcess}
                  style={{
                    boxShadow: '4px 4px 0 rgba(17, 24, 20, 0.8)',
                    border: '2px solid #111814'
                  }}
                  className="rounded-xl bg-[#111814] text-white px-4 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-gradient-to-r hover:from-[#F9F586] hover:to-[#A1FFCE] hover:text-[#111814] transition-all cursor-pointer"
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


      <footer className="w-full border-t border-neutral-900/10 bg-white/10 backdrop-blur-sm py-6 text-center text-[9px] font-black text-neutral-800 uppercase tracking-widest mt-12 shrink-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} DocuBrief Systems. All operations compiled in-memory.</p>
        </div>
      </footer>
    </div>
  );
}

