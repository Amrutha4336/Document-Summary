import React from 'react';
import { FileText, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-900/10 bg-white/45 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-white shadow-md active:scale-95 transition-all">
            <FileText className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-neutral-900 flex items-center gap-1.5 sm:text-lg">
              DocuBrief
              <span className="inline-flex items-center gap-0.5 rounded-lg bg-gradient-to-r from-[#F9F586] to-[#A1FFCE] px-2 py-0.5 text-[10px] font-black uppercase text-neutral-900 border border-neutral-900/15 shadow-sm">
                <Sparkles className="h-2.5 w-2.5" /> AI
              </span>
            </h1>
            <p className="hidden text-[10px] font-black uppercase tracking-wider text-neutral-500 sm:block">Document Summary & Audit</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
            v1.0.0
          </span>
        </div>
      </div>
    </header>
  );
}
