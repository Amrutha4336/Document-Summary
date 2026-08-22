'use client';

import React from 'react';
import { Loader2, Check, ArrowRight, Sparkles, FileText, Cpu, Search } from 'lucide-react';
import { ProcessingStep } from '@/types';

interface LoadingSkeletonProps {
  currentStep: ProcessingStep;
  isPdf: boolean;
}

export default function LoadingSkeleton({ currentStep, isPdf }: LoadingSkeletonProps) {
  // Setup steps with human-readable labels and descriptions
  const steps = [
    {
      id: 'uploading',
      label: 'Uploading Document',
      description: 'Preparing files and reading content buffers.',
      icon: FileText
    },
    {
      id: 'extracting',
      label: isPdf ? 'Extracting PDF Text' : 'Running OCR Text Engine',
      description: isPdf ? 'Parsing structural text blocks from pages.' : 'Optical Character Recognition processing (Tesseract).',
      icon: isPdf ? Search : Cpu
    },
    {
      id: 'summarizing',
      label: 'Generating AI Summary',
      description: 'Gemini is reading, analyzing, and formatting insights.',
      icon: Sparkles
    }
  ];

  const getStepStatus = (stepId: string) => {
    const stepOrder = ['uploading', 'extracting', 'summarizing'];
    const currentIdx = stepOrder.indexOf(currentStep === 'ocr' ? 'extracting' : currentStep);
    const stepIdx = stepOrder.indexOf(stepId);

    if (currentStep === 'error') return 'pending';
    if (stepIdx < currentIdx) return 'completed';
    if (stepId === 'extracting' && (currentStep === 'extracting' || currentStep === 'ocr')) return 'active';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col items-center justify-center py-6 text-center">
        {/* Main Spinner */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400 z-10" />
          <div className="absolute h-12 w-12 rounded-full bg-indigo-500/10 blur-xl"></div>
        </div>

        <h3 className="mt-4 text-base font-semibold text-slate-200">Analyzing your document...</h3>
        <p className="mt-1 text-xs text-slate-400 max-w-xs">
          This may take a moment depending on the size and complexity of your file.
        </p>
      </div>

      {/* Progress bar line */}
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
          style={{
            width: 
              currentStep === 'uploading' ? '25%' :
              (currentStep === 'extracting' || currentStep === 'ocr') ? '60%' :
              currentStep === 'summarizing' ? '85%' : '0%'
          }}
        ></div>
      </div>

      {/* Steps List */}
      <div className="mt-6 flex flex-col gap-4 border-t border-slate-800 pt-6">
        {steps.map((step, idx) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <div 
              key={step.id} 
              className={`flex items-start gap-4 transition-all duration-300
                ${status === 'pending' ? 'opacity-40' : 'opacity-100'}
              `}
            >
              {/* Step indicator circle */}
              <div className="flex shrink-0 items-center justify-center mt-0.5">
                {status === 'completed' ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                ) : status === 'active' ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 animate-pulse">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-slate-500 border border-slate-700/50">
                    <span className="text-xs font-semibold">{idx + 1}</span>
                  </div>
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className={`text-sm font-semibold ${status === 'active' ? 'text-indigo-400' : 'text-slate-200'}`}>
                    {step.label}
                  </h4>
                  {status === 'active' && (
                    <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-1 py-0.5 text-[10px] font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                      In Progress
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-400 leading-normal">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
