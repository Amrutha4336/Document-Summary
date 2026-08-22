'use client';

import React, { useState } from 'react';
import { 
  Copy, Check, ArrowLeft, 
  Lightbulb, Search, BookOpen, 
  Eye, EyeOff, FileDown, CheckCircle
} from 'lucide-react';
import { SummaryResult } from '@/types';

interface DashboardProps {
  result: SummaryResult;
  onReset: () => void;
}

export default function Dashboard({ result, onReset }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isRawTextExpanded, setIsRawTextExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    triggerToast('Copied to clipboard!');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const downloadSummaryAsMarkdown = () => {
    try {
      const markdownContent = `# Document Summary: ${result.fileName}

## Document Statistics
- **Pages**: ${result.pageCount}
- **Word Count**: ${result.wordCount}
- **Character Count**: ${result.characterCount}
- **Original File Size**: ${formatFileSize(result.fileSize)}

---

## The Big Picture (Executive Summary)
${result.summary}

---

## Key Takeaways
${result.keyPoints.map(point => `- ${point}`).join('\n')}

---

## What Could Be Stronger? (Suggestions)
${result.improvementSuggestions.map(sugg => `- ${sugg}`).join('\n')}
`;

      const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${result.fileName.split('.')[0]}_brief_analysis.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast('Markdown brief downloaded!');
    } catch (e) {
      console.error(e);
      triggerToast('Failed to trigger download.');
    }
  };

  const renderFormattedMarkdown = (md: string, bodyClass = "text-xs sm:text-sm font-bold leading-relaxed mb-4") => {
    if (!md) return null;
    
    return md.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('###')) {
        return <h3 key={idx} className="text-xs font-black text-[#111814] mt-6 mb-2 uppercase tracking-widest">{trimmed.slice(3).trim()}</h3>;
      }
      if (trimmed.startsWith('##')) {
        return <h2 key={idx} className="text-sm font-black text-[#111814] mt-8 mb-3 border-b border-[#111814]/10 pb-1.5 uppercase tracking-wider">{trimmed.slice(2).trim()}</h2>;
      }
      if (trimmed.startsWith('#')) {
        return <h1 key={idx} className="text-base font-black text-[#111814] mt-9 mb-4 uppercase tracking-wider">{trimmed.slice(1).trim()}</h1>;
      }
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        return (
          <li key={idx} className="ml-4 list-disc text-[#111814] text-xs sm:text-sm font-bold leading-relaxed mb-2">
            {formatBoldText(trimmed.slice(1).trim())}
          </li>
        );
      }
      if (trimmed === '') {
        return <div key={idx} className="h-3" />;
      }
      
      return (
        <p key={idx} className={bodyClass}>
          {formatBoldText(trimmed)}
        </p>
      );
    });
  };

  const formatBoldText = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-black text-neutral-950 underline decoration-2 decoration-[#111814]/15">{part}</strong>;
      }
      return part;
    });
  };

  const getFilteredRawText = () => {
    if (!searchTerm.trim()) return result.extractedText;
    const lines = result.extractedText.split('\n');
    const filtered = lines.filter(line => 
      line.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered.length > 0 
      ? filtered.join('\n') 
      : 'No matching terms found in extracted text.';
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2 select-text">
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-neutral-900 border border-neutral-800 px-5 py-3 text-xs font-bold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-6">
          <CheckCircle className="h-4 w-4 text-[#A1FFCE]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Editorial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
        
        {/* LEFT COLUMN: Sticky Metadata & Actions */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r border-[#111814]/10 pb-8 lg:pb-0 lg:pr-8 xl:pr-12">
          <div>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-neutral-800 hover:text-[#111814] transition-colors cursor-pointer group"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Analyze another file</span>
            </button>
            
            <h2 className="mt-4 text-xl sm:text-2xl font-black text-[#111814] leading-tight break-words" title={result.fileName}>
              {result.fileName}
            </h2>
            
            <div className="mt-3.5 flex flex-wrap items-center gap-2.5 text-[9px] font-black text-neutral-700 uppercase tracking-widest">
              <span className="bg-white/50 border border-neutral-900/10 px-2 py-0.5 rounded font-black text-neutral-950">
                {result.fileName.split('.').pop()?.toUpperCase()}
              </span>
              <span>&bull;</span>
              <span>{result.pageCount} {result.pageCount === 1 ? 'Page' : 'Pages'}</span>
              <span>&bull;</span>
              <span>{formatFileSize(result.fileSize)}</span>
            </div>

            <div className="mt-2 text-[9px] font-black text-neutral-700 uppercase tracking-widest">
              <span>{result.wordCount} words</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 mt-2">
            <button
              onClick={downloadSummaryAsMarkdown}
              style={{ border: '2px solid #111814' }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/55 px-4 py-3 text-xs font-black uppercase tracking-wider text-[#111814] hover:bg-white transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <FileDown className="h-4 w-4" />
              <span>Export Brief</span>
            </button>
            
            <button
              onClick={() => {
                const fullReport = `# Analysis: ${result.fileName}\n\n${result.summary}\n\n## Key Takeaways\n${result.keyPoints.map(p => `- ${p}`).join('\n')}`;
                copyToClipboard(fullReport, 'fullReport');
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#111814] px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition-all cursor-pointer shadow-md hover:bg-neutral-900 active:scale-[0.98]"
            >
              {copiedSection === 'fullReport' ? (
                <>
                  <Check className="h-4 w-4 text-[#A1FFCE]" />
                  <span>Copied brief</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy summary</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* RIGHT COLUMN: Editorial Document Reading Flow */}
        <section className="lg:col-span-8 flex flex-col">
          
          {/* THE BIG PICTURE */}
          <article className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-end justify-between border-b border-[#111814]/15 pb-2 mb-6">
              <span className="font-display text-4xl text-[#111814] uppercase tracking-normal select-none">
                01 / The Big Picture
              </span>
              <button
                onClick={() => copyToClipboard(result.summary, 'summaryOnly')}
                className="text-[9px] font-black uppercase tracking-widest text-[#111814]/65 hover:text-[#111814] transition-colors flex items-center gap-1 mb-1.5"
                title="Copy section"
              >
                {copiedSection === 'summaryOnly' ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="prose max-w-none text-neutral-900">
              {renderFormattedMarkdown(result.summary, "text-base sm:text-lg lg:text-2xl font-bold leading-relaxed mb-6 text-neutral-950")}
            </div>
          </article>

          {/* Spacer */}
          <div className="h-10" />

          {/* WHAT MATTERS */}
          <article className="animate-in fade-in slide-in-from-bottom-4 duration-300 delay-100">
            <div className="flex items-end justify-between border-b border-[#111814]/15 pb-2 mb-8">
              <span className="font-display text-4xl text-[#111814] uppercase tracking-normal select-none">
                02 / What Matters
              </span>
              <button
                onClick={() => copyToClipboard(result.keyPoints.join('\n'), 'keyPoints')}
                className="text-[9px] font-black uppercase tracking-widest text-[#111814]/65 hover:text-[#111814] transition-colors flex items-center gap-1 mb-1.5"
                title="Copy section"
              >
                {copiedSection === 'keyPoints' ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {result.keyPoints.length > 0 ? (
              <div className="flex flex-col">
                {result.keyPoints.map((point, idx) => {
                  const formattedIdx = String(idx + 1).padStart(2, '0');
                  return (
                    <div 
                      key={idx} 
                      className="grid grid-cols-1 md:grid-cols-12 items-start py-6 border-b border-[#111814]/10 first:pt-0 last:border-b-0"
                    >
                      {/* Huge elegant index numeral */}
                      <span className="md:col-span-2 text-3xl font-black font-mono tracking-tight text-[#111814] md:pt-0.5 mb-2 md:mb-0 select-none">
                        {formattedIdx}
                      </span>
                      <div className="md:col-span-10 text-xs sm:text-sm font-bold text-[#111814] leading-relaxed">
                        {formatBoldText(point)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#111814]/70 italic">No key points extracted.</p>
            )}
          </article>

          {/* Spacer */}
          <div className="h-10" />

          {/* WHAT COULD BE STRONGER */}
          <article className="animate-in fade-in slide-in-from-bottom-4 duration-300 delay-200">
            <div className="flex items-end justify-between border-b border-[#111814]/15 pb-2 mb-6">
              <span className="font-display text-4xl text-[#111814] uppercase tracking-normal select-none">
                03 / What Could Be Stronger
              </span>
              <button
                onClick={() => copyToClipboard(result.improvementSuggestions.join('\n'), 'suggestions')}
                className="text-[9px] font-black uppercase tracking-widest text-[#111814]/65 hover:text-[#111814] transition-colors flex items-center gap-1 mb-1.5"
                title="Copy section"
              >
                {copiedSection === 'suggestions' ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {result.improvementSuggestions.length > 0 ? (
              <div className="space-y-6">
                {result.improvementSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#111814] text-[#A1FFCE] border border-[#111814] mt-0.5 select-none">
                      <Lightbulb className="h-3 w-3" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-[#111814] leading-relaxed font-bold">
                        {suggestion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#111814]/70 italic">No improvement suggestions available.</p>
            )}
          </article>

          {/* Spacer */}
          <div className="h-10" />

          {/* SOURCE TEXT INSPECTOR */}
          <article className="border-t border-[#111814]/15 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-300 delay-300">
            <div className="flex items-center justify-between">
              <span className="font-display text-4xl text-[#111814] uppercase tracking-normal select-none">
                04 / Source Text
              </span>
              <button
                onClick={() => setIsRawTextExpanded(!isRawTextExpanded)}
                className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#111814] hover:underline cursor-pointer"
              >
                {isRawTextExpanded ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    <span>Hide Content</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    <span>Inspect Content</span>
                  </>
                )}
              </button>
            </div>

            {isRawTextExpanded && (
              <div className="mt-6 rounded-2xl border-2 border-[#111814] bg-white/20 p-4 shadow-sm animate-in slide-in-from-top-4 duration-300">
                <div className="relative w-full max-w-sm mb-4">
                  <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-[#111814]/50" />
                  <input
                    type="text"
                    placeholder="Search source content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border-2 border-[#111814] bg-white pl-9 pr-4 py-2.5 text-xs font-bold text-[#111814] placeholder-[#111814]/40 focus:outline-none"
                  />
                </div>
                
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar bg-white/50 border border-[#111814]/10 p-4 rounded-xl">
                  <pre className="whitespace-pre-wrap font-mono text-[11px] text-[#111814] leading-relaxed font-bold">
                    {getFilteredRawText()}
                  </pre>
                </div>
              </div>
            )}
          </article>

        </section>

      </div>
    </div>
  );
}

