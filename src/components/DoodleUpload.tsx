'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface DoodleUploadProps {
  onFileSelected: (file: File) => void;
  error: string | null;
  setError: (err: string | null) => void;
}

export default function DoodleUpload({
  onFileSelected,
  error,
  setError
}: DoodleUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(extension || '');
    if (!isValidType) {
      setError('Unsupported file type. Please upload a PDF or an image (PNG, JPG, JPEG).');
      return false;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 10MB.`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
    }
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerInput();
    }
  };

  return (
    <div className="w-full">
      <svg className="absolute w-0 h-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="squiggle" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise">
              <animate 
                attributeName="seed" 
                values="1;5;9;2;7;3;10;4;8;6" 
                dur="0.45s" 
                repeatCount="indefinite" 
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,image/png,image/jpeg,image/jpg"
        onChange={handleChange}
      />

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerInput}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        tabIndex={0}
        role="button"
        aria-label="Upload file drag area"
        className={`relative flex flex-col items-center justify-center cursor-pointer transition-all duration-300 select-none outline-none group
          ${isDragActive ? 'scale-105' : 'hover:scale-[1.03]'}
        `}
      >
        <div 
          className={`relative w-48 h-32 flex items-center justify-center transition-all duration-300
            ${isHovered || isDragActive ? 'squigglevision scale-110' : ''}
          `}
        >
          <svg 
            viewBox="0 0 160 100" 
            className="w-full h-full fill-none stroke-[#111814]"
            strokeWidth="2.8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {/* Sparkle details */}
            <g 
              className={`transition-transform duration-700 origin-center
                ${isHovered || isDragActive ? 'rotate-[45deg] scale-110' : ''}
              `}
              style={{ stroke: '#F7797D', transformOrigin: '80px 50px' }}
            >
              <path d="M22,25 L24,20 L26,25 L31,27 L26,29 L24,34 L22,29 L17,27 Z" strokeWidth="1.5" fill="#F7797D" fillOpacity="0.2" />
              <path d="M135,18 L136.5,14 L138,18 L142,19 L138,20.5 L136.5,24.5 L135,20.5 L131,19 Z" strokeWidth="1.5" fill="#F7797D" fillOpacity="0.2" />
            </g>

            {/* Scribble detail */}
            <path 
              d="M15,75 Q20,72 25,78" 
              stroke="#111814" 
              strokeWidth="2" 
            />
            
            {/* Background page sheet */}
            <g 
              className={`transition-transform duration-300 ease-out
                ${isHovered || isDragActive ? '-translate-y-5 translate-x-2' : ''}
              `}
            >
              <polygon points="50,15 105,15 115,25 115,70 50,70" strokeWidth="2.8" fill="rgba(255,255,255,0.9)" />
              <line x1="62" y1="32" x2="102" y2="32" strokeWidth="2.2" />
              <line x1="62" y1="44" x2="92" y2="44" strokeWidth="2.2" />
              <line x1="62" y1="56" x2="102" y2="56" strokeWidth="2.2" />
            </g>

            {/* Middle page sheet */}
            <g 
              className={`transition-transform duration-300 ease-out
                ${isHovered || isDragActive ? '-translate-y-9 -translate-x-1.5 rotate-[-4deg]' : ''}
              `}
            >
              <polygon points="40,25 90,25 100,35 100,80 40,80" fill="white" stroke="#111814" strokeWidth="2.8" />
              <line x1="52" y1="40" x2="88" y2="40" stroke="#111814" strokeWidth="2.2" />
              <line x1="52" y1="50" x2="80" y2="50" stroke="#111814" strokeWidth="2.2" />
              <line x1="52" y1="60" x2="88" y2="60" stroke="#111814" strokeWidth="2.2" />
              
              <path 
                d="M84,33 C84,27 91,27 91,33 L91,48 C91,53 82,53 82,48 L82,37 C82,34 87,34 87,37 L87,46" 
                stroke="#F7797D" 
                strokeWidth="2" 
                fill="none"
              />
            </g>

            {/* Folder Back Panel (Lime Crush Mint #A1FFCE) */}
            <path 
              d="M10,85 L10,35 Q10,30 15,30 L55,30 Q60,30 65,35 L75,42 L138,42 Q144,42 144,47 L144,85 Q144,90 138,90 L16,90 Q10,90 10,85 Z" 
              fill="#A1FFCE" 
              stroke="#111814" 
              strokeWidth="3.2" 
            />

            {/* Folder Front Panel (Lime Crush Yellow #F9F586) */}
            <path 
              d="M10,85 L18,52 Q20,48 26,48 L138,48 Q144,48 142,55 L132,86 Q130,90 124,90 L16,90 Q10,90 10,85 Z" 
              fill="#F9F586" 
              stroke="#111814" 
              strokeWidth="3.2"
              className={`transition-all duration-300 origin-bottom
                ${isHovered || isDragActive ? 'rotate-[-3deg] translate-y-0.5' : ''}
              `}
            />
          </svg>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111814] bg-[#111814]/5 px-2.5 py-1 rounded-full group-hover:bg-[#111814]/10 transition-colors">
            {isDragActive ? 'Drop document' : 'drag file here'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-950/20 bg-red-50/95 p-4 text-xs text-red-950 shadow-sm animate-in fade-in slide-in-from-top-2 font-semibold leading-relaxed max-w-sm mx-auto">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-700 mt-0.5" />
          <div className="flex-1">
            <h5 className="font-extrabold uppercase tracking-widest text-red-900">Validation Error</h5>
            <p className="mt-0.5">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="text-red-700 hover:text-red-950 font-bold"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

