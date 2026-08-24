import React from 'react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Branding Group */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center bg-black text-white p-2 rounded-lg shadow-sm select-none">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-5 h-5"
            >
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a1 1 0 0 0 1 1h4" />
              <path d="M10 9h4" />
              <path d="M10 13h4" />
              <path d="M10 17h4" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-neutral-900 select-none">
              DocuSummary
            </span>
            <span className="text-[10px] font-medium tracking-wider text-neutral-500 uppercase select-none">
              DOCUMENT ASSISTANT
            </span>
          </div>
        </div>

        {/* Right Navigation Group */}
        <div className="flex items-center gap-6">
          <a href="#features" className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors">
            How it works
          </a>
          <a href="#version" className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-0.5">
            v1.0 <span className="text-neutral-400 font-normal">&gt;</span>
          </a>
        </div>
        
      </div>
    </header>
  );
}

