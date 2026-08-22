'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, Sparkles, X, ChevronRight } from 'lucide-react';
import { SummaryLength } from '@/types';

interface FilePreviewProps {
  file: File;
  onClear: () => void;
  onProcess: (length: SummaryLength) => void;
}

export default function FilePreview({ file, onClear, onProcess }: FilePreviewProps) {
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Format file size helper
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = file.type.startsWith('image/') || ['png', 'jpg', 'jpeg'].includes(file.name.split('.').pop()?.toLowerCase() || '');
  const fileExtension = file.name.split('.').pop()?.toUpperCase() || 'FILE';

  // Generate local preview URL if file is an image
  useEffect(() => {
    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file, isImage]);

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Selected Document</h3>
        <button
          onClick={onClear}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title="Remove document"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Document Info Card */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center rounded-xl bg-slate-950 p-4 border border-slate-800/60">
        {isImage && previewUrl ? (
          <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt={file.name} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <FileText className="h-8 w-8" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-200 truncate">{file.name}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-medium text-slate-300">
              {fileExtension}
            </span>
            <span>&bull;</span>
            <span>{formatFileSize(file.size)}</span>
            <span>&bull;</span>
            <span>{isImage ? 'Image Document' : 'PDF Document'}</span>
          </div>
        </div>
      </div>

      {/* Summary Options Configuration */}
      <div className="mt-6 border-t border-slate-800 pt-6">
        <label className="text-sm font-medium text-slate-300">Choose Summary Length</label>
        <p className="mt-1 text-xs text-slate-400">Select how detailed you want the generated brief to be.</p>
        
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {(['short', 'medium', 'long'] as SummaryLength[]).map((length) => (
            <button
              key={length}
              type="button"
              onClick={() => setSummaryLength(length)}
              className={`rounded-xl border py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 active:scale-[0.98]
                ${summaryLength === length
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:bg-slate-900 hover:text-slate-200'
                }
              `}
            >
              {length}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-slate-950/40 p-3 border border-slate-800/40 text-xs text-slate-400 leading-relaxed">
          {summaryLength === 'short' && (
            <span><strong>Short Summary:</strong> Generates a highly concise, 2-3 sentence brief. Ideal for quick scanning of main conclusions.</span>
          )}
          {summaryLength === 'medium' && (
            <span><strong>Medium Summary:</strong> Generates a balanced 2-3 paragraph brief containing major ideas, important context, and results.</span>
          )}
          {summaryLength === 'long' && (
            <span><strong>Long Summary:</strong> Generates a detailed, comprehensive brief highlighting all major sections and complex arguments.</span>
          )}
        </div>
      </div>

      {/* Submit Trigger */}
      <button
        onClick={() => onProcess(summaryLength)}
        className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 hover:shadow-indigo-500/30 active:scale-[0.99]"
      >
        <span>Extract & Analyze Document</span>
        <Sparkles className="h-4 w-4" />
      </button>
    </div>
  );
}
