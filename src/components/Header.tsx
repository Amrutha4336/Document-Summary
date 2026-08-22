import React from 'react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#111814]/10 bg-white/35 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Geometric branding layout */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center select-none font-mono">
            <span className="text-xs sm:text-sm font-black tracking-tighter bg-[#111814] text-white px-2 py-1 uppercase border-2 border-[#111814]">
              Docu
            </span>
            <span className="text-xs sm:text-sm font-black tracking-tighter text-[#111814] px-2 py-1 uppercase border-2 border-[#111814] bg-transparent">
              Brief
            </span>
          </div>
          <span className="inline-flex items-center gap-0.5 rounded bg-gradient-to-r from-[#F9F586] to-[#A1FFCE] px-1.5 py-0.5 text-[8px] font-black uppercase text-[#111814] border border-[#111814]/15 shadow-sm tracking-wider">
            AI.01
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-800">
            Document workspace
          </span>
        </div>
        
      </div>
    </header>
  );
}

