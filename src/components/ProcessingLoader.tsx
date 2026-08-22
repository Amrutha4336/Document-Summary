'use client';

import React, { useState, useEffect } from 'react';
import { ProcessingStep } from '@/types';
import { Cpu, Database, Binary, ShieldCheck } from 'lucide-react';

interface ProcessingLoaderProps {
  currentStep: ProcessingStep;
  file: File | null;
}

export default function ProcessingLoader({ currentStep, file }: ProcessingLoaderProps) {
  const [statusText, setStatusText] = useState('SYSTEM BOOTING');
  const [progressVal, setProgressVal] = useState(10);

  useEffect(() => {
    switch (currentStep) {
      case 'uploading':
        setStatusText('READING DOCUMENT');
        setProgressVal(20);
        break;
      case 'extracting':
        setStatusText('EXTRACTING TEXT');
        setProgressVal(50);
        break;
      case 'ocr':
        setStatusText('EXTRACTING TEXT');
        setProgressVal(65);
        break;
      case 'summarizing':
        setStatusText('ANALYZING CONTENT');
        setProgressVal(85);
        break;
      case 'success':
        setStatusText('FINALIZING INSIGHTS');
        setProgressVal(100);
        break;
      default:
        setStatusText('READING DOCUMENT');
        break;
    }
  }, [currentStep]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const fileExt = file ? file.name.split('.').pop()?.toUpperCase() : 'UNKNOWN';
  const fileSizeStr = file ? formatFileSize(file.size) : '0 KB';
  const isPdf = file ? (file.type === 'application/pdf' || file.name.endsWith('.pdf')) : false;

  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, rgba(249, 245, 134, 0.96), rgba(161, 255, 206, 0.96))',
        boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
        border: '1px solid rgba(20, 30, 20, 0.15)',
      }}
      className="w-full flex flex-col items-center justify-center max-w-xl mx-auto rounded-3xl p-8 relative overflow-hidden select-none animate-in fade-in zoom-in-95 duration-300"
    >
      <div 
        className="absolute left-0 w-full h-[3px] opacity-70 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--sunrise-coral), var(--lime-mint), transparent)',
          boxShadow: '0 0 10px var(--sunrise-coral), 0 0 20px var(--lime-mint)',
          animation: 'sweep 3.5s ease-in-out infinite'
        }}
      />

      <div className="relative h-44 w-full flex items-center justify-center border-2 border-[#111814] bg-white/40 rounded-2xl overflow-hidden mt-2">
        <div className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-white/10 via-yellow/10 to-coral/10 blur-2xl animate-pulse" />

        <div className="cube-container scale-[0.85] sm:scale-100 z-10">
          <div className="cube">
            <div className="cube-face cube-face-front">PDF</div>
            <div className="cube-face cube-face-back">AI</div>
            <div className="cube-face cube-face-right">OCR</div>
            <div className="cube-face cube-face-left">GEN</div>
            <div className="cube-face cube-face-top">TXT</div>
            <div className="cube-face cube-face-bottom">MD</div>
          </div>
        </div>

        <div className="absolute top-3 left-3 font-mono text-[9px] font-black text-[#111814]/60 leading-none">SCAN.ACTIVE</div>
        <div className="absolute top-3 right-3 font-mono text-[9px] font-black text-[#111814]/60 leading-none">SIGNAL: FULL</div>
        <div className="absolute bottom-3 left-3 font-mono text-[9px] font-black text-[#111814]/60 leading-none">CORE: GEMINI</div>
        <div className="absolute bottom-3 right-3 font-mono text-[9px] font-black text-[#111814]/60 leading-none">[AUDIT]</div>

        <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end justify-center gap-[3px] px-8 opacity-40">
          {Array.from({ length: 28 }).map((_, i) => {
            const delay = (i % 5) * 0.15;
            const duration = 0.6 + (i % 3) * 0.3;
            return (
              <div 
                key={i} 
                className="w-[3px] bg-[#111814] rounded-t-full"
                style={{
                  height: `${8 + (i % 4) * 8}px`,
                  animation: `floatParticle ${duration}s ease-in-out ${delay}s infinite alternate`
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-8 text-center w-full">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] bg-[#111814] text-white px-3 py-1 rounded-full shadow-sm">
          Processing
        </span>
        <h3 className="mt-4 text-sm font-black tracking-widest text-[#111814] uppercase animate-pulse">
          {statusText}
        </h3>
        
        <div className="mt-4 h-2 w-full bg-white/40 rounded-full overflow-hidden border-2 border-[#111814] p-[1px]">
          <div 
            className="h-full rounded-full bg-[#111814] transition-all duration-700 ease-out"
            style={{ width: `${progressVal}%` }}
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full border-t border-[#111814]/15 pt-6">
        <div className="rounded-xl bg-white/55 p-3 border border-neutral-900/10 flex flex-col justify-between min-h-[60px]">
          <span className="text-[9px] uppercase font-black text-[#111814]/60 tracking-wider flex items-center gap-1">
            <Binary className="h-3 w-3 text-[#111814]" /> Format
          </span>
          <p className="mt-1 text-xs font-black text-[#111814]">{fileExt}</p>
        </div>

        <div className="rounded-xl bg-white/55 p-3 border border-neutral-900/10 flex flex-col justify-between min-h-[60px]">
          <span className="text-[9px] uppercase font-black text-[#111814]/60 tracking-wider flex items-center gap-1">
            <Database className="h-3 w-3 text-[#111814]" /> Size
          </span>
          <p className="mt-1 text-xs font-black text-[#111814]">{fileSizeStr}</p>
        </div>

        <div className="rounded-xl bg-white/55 p-3 border border-neutral-900/10 flex flex-col justify-between min-h-[60px]">
          <span className="text-[9px] uppercase font-black text-[#111814]/60 tracking-wider flex items-center gap-1">
            <Cpu className="h-3 w-3 text-[#111814]" /> engine
          </span>
          <p className="mt-1 text-xs font-black text-[#111814]">
            {isPdf ? 'PDF.JS' : 'OCR'}
          </p>
        </div>

        <div className="rounded-xl bg-white/55 p-3 border border-neutral-900/10 flex flex-col justify-between min-h-[60px]">
          <span className="text-[9px] uppercase font-black text-[#111814]/60 tracking-wider flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-[#111814]" /> status
          </span>
          <p className="mt-1 text-xs font-black text-white px-1.5 py-0.5 rounded bg-[#111814] w-fit text-[10px]">
            ACTIVE
          </p>
        </div>
      </div>
    </div>
  );
}
