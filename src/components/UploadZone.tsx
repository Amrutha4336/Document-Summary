'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, File, AlertCircle, RefreshCw } from 'lucide-react';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  error: string | null;
  setError: (err: string | null) => void;
}

export default function UploadZone({ onFileSelected, error, setError }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate uploaded files
  const validateFile = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    // Check mime type or extension
    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(extension || '');
    if (!isValidType) {
      setError('Unsupported file type. Please upload a PDF or an image (PNG, JPG, JPEG).');
      return false;
    }

    // Max file size: 10MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 10MB (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller file.`);
      return false;
    }

    setError(null);
    return true;
  };

  // Handle drag events
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  // Handle drop event
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

  // Handle traditional file input select
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
    }
  };

  // Trigger file browser dialog
  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 min-h-[300px]
          ${isDragActive 
            ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.1)]' 
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60 hover:shadow-xl'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,image/png,image/jpeg,image/jpg"
          onChange={handleChange}
        />

        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-400 group-hover:scale-110 group-hover:text-indigo-400 group-hover:bg-slate-800/80 transition-all duration-300">
          <UploadCloud className="h-7 w-7" />
        </div>

        <h3 className="mt-4 text-base font-semibold text-slate-200">
          Drag & drop your document here
        </h3>
        <p className="mt-2 text-sm text-slate-400 max-w-sm">
          Supports <span className="font-semibold text-slate-300">PDF documents</span> and <span className="font-semibold text-slate-300">Images (PNG, JPG, JPEG)</span> up to 10MB.
        </p>

        <button
          type="button"
          className="mt-6 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-md active:scale-95"
          onClick={(e) => {
            e.stopPropagation();
            onButtonClick();
          }}
        >
          Select from files
        </button>

        {isDragActive && (
          <div className="absolute inset-0 rounded-2xl bg-indigo-500/5 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <span className="text-sm font-bold text-indigo-400 tracking-wide uppercase">Drop to Upload</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-900/30 bg-red-950/20 p-4 text-sm text-red-400 shadow-md animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <div className="flex-1">
            <h5 className="font-semibold text-red-300">Validation Error</h5>
            <p className="mt-0.5 text-red-400/90 leading-relaxed">{error}</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setError(null);
            }} 
            className="text-red-400 hover:text-red-300 p-0.5 rounded transition-colors"
            title="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
