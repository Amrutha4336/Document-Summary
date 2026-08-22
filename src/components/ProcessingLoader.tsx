'use client';

import React, { useState, useEffect } from 'react';
import { ProcessingStep } from '@/types';
import { FileText, Cpu, Check } from 'lucide-react';

interface ProcessingLoaderProps {
  currentStep: ProcessingStep;
  file: File | null;
}

export default function ProcessingLoader({ currentStep, file }: ProcessingLoaderProps) {
  const [largePhrase, setLargePhrase] = useState('READING');
  const [detailPhrase, setDetailPhrase] = useState('your document');
  const [progressVal, setProgressVal] = useState(10);
  const [simulatedPage, setSimulatedPage] = useState(1);

  // Natural human product language state mappings
  useEffect(() => {
    switch (currentStep) {
      case 'uploading':
        setLargePhrase('READING');
        setDetailPhrase('your document');
        setProgressVal(20);
        break;
      case 'extracting':
      case 'ocr':
        setLargePhrase('EXTRACTING');
        setDetailPhrase('the important parts');
        setProgressVal(60);
        break;
      case 'summarizing':
        setLargePhrase('BUILDING');
        setDetailPhrase('your summary');
        setProgressVal(85);
        break;
      case 'success':
        setLargePhrase('FINISHING');
        setDetailPhrase('up');
        setProgressVal(100);
        break;
      default:
        setLargePhrase('READING');
        setDetailPhrase('your document');
        break;
    }
  }, [currentStep]);

  // Simulate scanning pages
  useEffect(() => {
    if (currentStep === 'idle' || currentStep === 'success' || currentStep === 'error') {
      return;
    }
    const isPdf = file ? (file.type === 'application/pdf' || file.name.endsWith('.pdf')) : false;
    if (!isPdf) {
      setSimulatedPage(1);
      return;
    }

    // PDF scanning page ticker simulation
    const interval = setInterval(() => {
      setSimulatedPage((prev) => {
        if (currentStep === 'extracting' || currentStep === 'ocr') {
          return prev + 1;
        } else if (currentStep === 'summarizing') {
          return Math.min(prev + 1, 8); // stop at 8 pages for simulation
        }
        return prev;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [currentStep, file]);

  const fileExt = file ? file.name.split('.').pop()?.toUpperCase() : 'PDF';
  const isPdf = file ? (file.type === 'application/pdf' || file.name.endsWith('.pdf')) : false;

  return (
    <div className="w-full flex flex-col items-center justify-center max-w-md mx-auto select-none animate-in fade-in zoom-in-95 duration-300">
      
      {/* Document Scanning Visualization Wrapper */}
      <div className="relative flex flex-col items-center justify-center py-6 w-full">
        
        {/* Background Aura */}
        <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-[#F9F586]/20 via-[#A1FFCE]/25 to-[#F7797D]/10 blur-2xl animate-pulse pointer-events-none" />

        {/* The Stylized Paper Object */}
        <div className="relative w-44 h-56 bg-white border-2 border-[#111814] rounded-2xl shadow-xl overflow-hidden flex flex-col p-4 z-10 transition-all duration-300">
          
          {/* Top Paper Lip Line (header section) */}
          <div className="flex items-center justify-between mb-4 border-b border-[#111814]/10 pb-2">
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[#111814]/70" />
              <span className="text-[8px] font-black uppercase tracking-wider text-[#111814]/60 truncate max-w-[80px]">
                {file?.name || 'document'}
              </span>
            </div>
            <span className="text-[8px] font-black uppercase tracking-wider bg-[#111814] text-white px-1.5 py-0.5 rounded">
              {fileExt}
            </span>
          </div>

          {/* Dummy Lines representing text contents */}
          <div className="space-y-2.5 flex-1">
            <div className="h-2 bg-[#111814]/10 rounded w-5/6" />
            <div className="h-2 bg-[#111814]/10 rounded w-full" />
            <div className="h-2 bg-[#111814]/10 rounded w-4/5" />
            
            <div className="h-2 bg-[#111814]/10 rounded w-11/12" />
            <div className="h-2 bg-[#111814]/10 rounded w-full" />
            <div className="h-2 bg-[#111814]/10 rounded w-2/3" />

            <div className="h-2 bg-[#111814]/10 rounded w-3/4" />
            <div className="h-2 bg-[#111814]/10 rounded w-5/6" />
          </div>

          {/* The Holographic Loader (Rotating 3D Cube) inside or floating in the page */}
          <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[0.5px]">
            <div className="cube-container scale-[0.65] z-20">
              <div className="cube">
                <div className="cube-face cube-face-front bg-white/95">PDF</div>
                <div className="cube-face cube-face-back bg-white/95">AI</div>
                <div className="cube-face cube-face-right bg-white/95">OCR</div>
                <div className="cube-face cube-face-left bg-white/95">GEN</div>
                <div className="cube-face cube-face-top bg-white/95">TXT</div>
                <div className="cube-face cube-face-bottom bg-white/95">MD</div>
              </div>
            </div>
          </div>

          {/* Scanning Sweep Laser Line */}
          <div 
            className="absolute left-0 w-full h-[3px] opacity-90 pointer-events-none z-30"
            style={{
              background: 'linear-gradient(90deg, transparent, #F7797D, #A1FFCE, transparent)',
              boxShadow: '0 0 10px #F7797D, 0 0 20px #A1FFCE',
              animation: 'sweep 2.8s ease-in-out infinite'
            }}
          />
        </div>
      </div>

      {/* Human-designed Progress text & details */}
      <div className="mt-6 text-center w-full z-10 px-4">
        <h3 className="font-display text-5xl text-[#111814] uppercase leading-none tracking-wide select-none">
          {largePhrase}
        </h3>
        <p className="mt-2 text-[10px] font-black text-[#111814]/70 uppercase tracking-widest leading-none select-none">
          {detailPhrase}
        </p>
        
        {/* Simple elegant inline loader bar */}
        <div className="mt-5 h-2.5 w-full bg-white/40 rounded-full overflow-hidden border-2 border-[#111814] p-[1.5px]">
          <div 
            className="h-full rounded-full bg-[#111814] transition-all duration-700 ease-out"
            style={{ width: `${progressVal}%` }}
          />
        </div>

        {/* Page / Progress status indicators */}
        <div className="mt-4 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-[#111814]/60 border-t border-[#111814]/10 pt-3.5">
          <span>Processing state</span>
          {isPdf ? (
            <span className="font-mono text-[#111814] bg-[#111814]/5 px-2 py-0.5 rounded">
              scanning page {String(simulatedPage).padStart(2, '0')}
            </span>
          ) : (
            <span className="font-mono text-[#111814] bg-[#111814]/5 px-2 py-0.5 rounded">
              scanning image
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


