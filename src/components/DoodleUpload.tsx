'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { AlertCircle } from 'lucide-react';

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
    <div className="w-full flex flex-col items-center">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,image/png,image/jpeg,image/jpg"
        onChange={handleChange}
      />

      {/* Main Upload Card Container */}
      <div className="w-full bg-[#fbfbfb] border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col items-center justify-center">
        
        {/* Dashed Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerInput}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label="Upload file drag area"
          className={`w-full border-2 border-dashed rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer select-none outline-none
            ${isDragActive 
              ? 'border-teal-700 bg-teal-55/10' 
              : 'border-neutral-200 bg-white/40 hover:border-neutral-350 hover:bg-white/60'
            }
          `}
        >
          {/* Upload Icon Container */}
          <div className="flex items-center justify-center w-14 h-14 bg-white border border-neutral-100 rounded-2xl shadow-xs mb-5">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-5.5 h-5.5 text-neutral-600"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2 text-center">
            Drop your document here
          </h3>

          <p className="text-xs sm:text-sm text-neutral-550 text-center max-w-md mb-6 leading-relaxed">
            Upload PDF or image files (PNG, JPG, JPEG) up to 10 MB for instant summarization & analysis.
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerInput();
            }}
            className="bg-black text-white hover:bg-neutral-850 active:scale-97 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs mb-4 cursor-pointer"
          >
            Choose file
          </button>

          <p className="text-xs text-neutral-400 text-center">
            or drag and drop your file directly onto this canvas
          </p>
        </div>

        {/* Key Features checklist row */}
        <div className="w-full flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-6 mt-6 border-t border-neutral-150">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 select-none">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-4.5 h-4.5 text-neutral-400"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>Digital & scanned PDFs</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 select-none">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-4.5 h-4.5 text-neutral-400"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>OCR for document images</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 select-none">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-4.5 h-4.5 text-neutral-400"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>In-memory private pipeline</span>
          </div>
        </div>

      </div>

      {error && (
        <div className="w-full max-w-md mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs text-red-950 shadow-sm animate-in fade-in slide-in-from-top-2 font-semibold leading-relaxed">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-750 mt-0.5" />
          <div className="flex-1">
            <h5 className="font-extrabold uppercase tracking-widest text-red-900">Validation Error</h5>
            <p className="mt-0.5">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="text-red-705 hover:text-red-950 font-bold"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
