'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import DoodleUpload from '@/components/DoodleUpload';
import ProcessingLoader from '@/components/ProcessingLoader';
import SummaryLengthSelector from '@/components/SummaryLengthSelector';
import Dashboard from '@/components/Dashboard';
import { SummaryLength, SummaryResult, ProcessingStep, ProcessingError } from '@/types';
import { Sparkles, FileText, Cpu, Lightbulb, AlertTriangle } from 'lucide-react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [step, setStep] = useState<ProcessingStep>('idle');
  const [error, setError] = useState<ProcessingError | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');

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

  const handleProcess = async () => {
    if (!file) return;

    setStep('uploading');
    setError(null);

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    const uploadTimer = setTimeout(() => {
      setStep(isPdf ? 'extracting' : 'ocr');
    }, 1000);

    const extractionTimer = setTimeout(() => {
      setStep('summarizing');
    }, 2400);

    const startTime = Date.now();

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('length', summaryLength);

      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      clearTimeout(uploadTimer);
      clearTimeout(extractionTimer);

      const data = await response.json();

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

      setResult(data);
      setStep('success');
    } catch (err: any) {
      clearTimeout(uploadTimer);
      clearTimeout(extractionTimer);

      const elapsed = Date.now() - startTime;
      const minLoadTime = 3200;
      if (elapsed < minLoadTime) {
        await new Promise((resolve) => setTimeout(resolve, minLoadTime - elapsed));
      }

      setError({
        message: 'A network communication error occurred. Please verify your internet connection and try again.'
      });
      setStep('error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-[#111814] relative selection:bg-[#111814]/15 selection:text-[#111814]">
      <div className="grid-overlay" />

      <Header />

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-8 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto relative z-10">

        {(step === 'idle' || step === 'error') && !result && (
          <div className="text-center max-w-2xl mx-auto mt-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-4xl font-black tracking-tight leading-none sm:text-5xl text-[#111814]">
              Understand Your Documents{' '}
              <span
                className="bg-gradient-to-r from-[#F9F586] to-[#A1FFCE] bg-clip-text text-transparent inline-block font-extrabold relative"
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
              </span>
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-[#111814]/80 leading-relaxed max-w-md mx-auto font-black uppercase tracking-widest">
              AI-Powered summary brief audits & layout auditing reports.
            </p>
          </div>
        )}

        <div className="w-full flex-1 flex flex-col justify-start">

          {step === 'idle' && !file && (
            <div className="max-w-xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
              <DoodleUpload
                onFileSelected={handleFileSelected}
                selectedFile={null}
                onClear={handleReset}
                error={validationError}
                setError={setValidationError}
              />

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="rounded-2xl border-2 border-[#111814] bg-white/35 p-5 shadow-sm hover:translate-y-[-2px] transition-transform">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111814] text-[#A1FFCE] border border-[#111814]">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="mt-4 text-xs font-black uppercase tracking-wider text-[#111814]">Digital Parsing</h4>
                  <p className="mt-2 text-[11px] text-[#111814]/75 leading-relaxed font-bold">Extracts content, preserving paragraphs and formatting.</p>
                </div>

                <div className="rounded-2xl border-2 border-[#111814] bg-white/35 p-5 shadow-sm hover:translate-y-[-2px] transition-transform">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111814] text-[#F9F586] border border-[#111814]">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="mt-4 text-xs font-black uppercase tracking-wider text-[#111814]">Smart Summaries</h4>
                  <p className="mt-2 text-[11px] text-[#111814]/75 leading-relaxed font-bold">Converts texts into custom segmented reading briefs.</p>
                </div>

                <div className="rounded-2xl border-2 border-[#111814] bg-white/35 p-5 shadow-sm hover:translate-y-[-2px] transition-transform">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111814] text-[#F7797D] border border-[#111814]">
                    <Lightbulb className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="mt-4 text-xs font-black uppercase tracking-wider text-[#111814]">Structural Audits</h4>
                  <p className="mt-2 text-[11px] text-[#111814]/75 leading-relaxed font-bold">Identifies logical leaks, missing sections, and weak content.</p>
                </div>
              </div>
            </div>
          )}

          {step === 'idle' && file && !result && (
            <div className="max-w-md mx-auto w-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <DoodleUpload
                onFileSelected={handleFileSelected}
                selectedFile={file}
                onClear={handleReset}
                error={validationError}
                setError={setValidationError}
              />

              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(249, 245, 134, 0.96), rgba(161, 255, 206, 0.96))',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
                  border: '1px solid rgba(20, 30, 20, 0.15)',
                }}
                className="rounded-3xl p-6 shadow-xl"
              >
                <label className="text-[10px] font-black uppercase tracking-widest text-[#111814]/70">Select Brief Complexity</label>
                <div className="mt-3.5">
                  <SummaryLengthSelector selected={summaryLength} onChange={setSummaryLength} />
                </div>

                <button
                  onClick={handleProcess}
                  style={{
                    boxShadow: '4px 4px 0 rgba(17, 24, 20, 0.8)',
                    border: '2px solid #111814'
                  }}
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-[#111814] text-white py-3 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.99] hover:bg-gradient-to-r hover:from-[#F9F586] hover:to-[#A1FFCE] hover:text-[#111814]"
                >
                  <span>Begin Document Audit</span>
                  <Sparkles className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {['uploading', 'extracting', 'ocr', 'summarizing'].includes(step) && (
            <div className="max-w-md mx-auto w-full">
              <ProcessingLoader currentStep={step} file={file} />
            </div>
          )}

          {step === 'error' && error && (
            <div className="max-w-md mx-auto w-full rounded-3xl border-2 border-[#111814] bg-white p-6 shadow-2xl text-center animate-in fade-in zoom-in-95">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 border-2 border-red-600 shadow-sm">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-base font-black tracking-widest uppercase text-[#111814]">Audit Halted</h3>
              <p className="mt-3 text-xs font-bold text-red-700 leading-relaxed">{error.message}</p>

              {error.isScannedPdfFallback && (
                <div className="mt-4 rounded-2xl bg-neutral-950 p-4 text-[10px] text-[#F9F586] text-left leading-relaxed border-2 border-[#111814]">
                  <strong className="block mb-1 text-white font-extrabold uppercase tracking-wide">🔍 Standard parser bypassed:</strong>
                  Standard text extraction only works for digital, selectable PDFs. For scanned pages or image documents, please convert them to JPG/PNG images and upload them directly to run OCR.
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleReset}
                  className="rounded-xl border-2 border-neutral-900 bg-neutral-950 px-4 py-2.5 text-xs font-black uppercase text-white hover:bg-neutral-800 transition-colors cursor-pointer"
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
                  Retry Audit
                </button>
              </div>
            </div>
          )}

          {step === 'success' && result && (
            <div className="animate-in fade-in duration-500">
              <Dashboard result={result} onReset={handleReset} />
            </div>
          )}

        </div>
      </main>

      <footer className="w-full border-t border-neutral-900/10 bg-white/20 backdrop-blur-sm py-6 text-center text-[9px] font-black text-neutral-800 uppercase tracking-widest mt-12 shrink-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} DocuBrief Systems. All operations compiled in-memory.</p>
        </div>
      </footer>
    </div>
  );
}
