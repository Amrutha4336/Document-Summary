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

  const renderFormattedMarkdown = (md: string) => {
    if (!md) return null;
    
    return md.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('###')) {
        return <h3 key={idx} className="text-sm font-extrabold text-[#111814] mt-5 mb-1.5 uppercase tracking-wide">{trimmed.slice(3).trim()}</h3>;
      }
      if (trimmed.startsWith('##')) {
        return <h2 key={idx} className="text-base font-black text-[#111814] mt-6 mb-2 border-b border-[#111814]/15 pb-1 tracking-tight">{trimmed.slice(2).trim()}</h2>;
      }
      if (trimmed.startsWith('#')) {
        return <h1 key={idx} className="text-lg font-black text-[#111814] mt-7 mb-3 tracking-tight">{trimmed.slice(1).trim()}</h1>;
      }
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        return (
          <li key={idx} className="ml-4 list-disc text-[#111814] text-xs font-semibold leading-relaxed mb-1.5">
            {formatBoldText(trimmed.slice(1).trim())}
          </li>
        );
      }
      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }
      
      return (
        <p key={idx} className="text-[#111814] text-xs font-bold leading-relaxed mb-3">
          {formatBoldText(trimmed)}
        </p>
      );
    });
  };

  const formatBoldText = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-extrabold text-neutral-950 underline decoration-2 decoration-[#111814]/20">{part}</strong>;
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

  const panelStyle = {
    background: 'linear-gradient(135deg, rgba(249, 245, 134, 0.96), rgba(161, 255, 206, 0.96))',
    boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
    border: '2px solid rgba(20, 30, 20, 0.15)',
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-300">
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-neutral-900 border border-neutral-800 px-5 py-3 text-xs font-bold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-6">
          <CheckCircle className="h-4 w-4 text-[#A1FFCE]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-900/10 pb-6">
        <div>
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-800 hover:text-[#111814] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Analyze another document</span>
          </button>
          <h2 className="mt-3 text-2xl font-black text-[#111814] truncate max-w-xl" title={result.fileName}>
            {result.fileName}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-bold text-neutral-700 uppercase tracking-widest">
            <span className="bg-white/40 border border-neutral-900/10 px-2 py-0.5 rounded text-neutral-950 font-black">
              {result.fileName.split('.').pop()?.toUpperCase()}
            </span>
            <span>&bull;</span>
            <span>{result.pageCount} {result.pageCount === 1 ? 'Page' : 'Pages'}</span>
            <span>&bull;</span>
            <span>{formatFileSize(result.fileSize)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadSummaryAsMarkdown}
            style={{ border: '2px solid #111814' }}
            className="flex items-center gap-2 rounded-xl bg-white/55 px-4 py-3 text-xs font-black uppercase tracking-wider text-[#111814] hover:bg-white transition-all cursor-pointer shadow-sm"
          >
            <FileDown className="h-4 w-4" />
            <span>Export Report</span>
          </button>
          
          <button
            onClick={() => {
              const fullReport = `# Analysis: ${result.fileName}\n\n${result.summary}\n\n## Key Takeaways\n${result.keyPoints.map(p => `- ${p}`).join('\n')}`;
              copyToClipboard(fullReport, 'fullReport');
            }}
            className="flex items-center gap-2 rounded-xl bg-[#111814] px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition-all cursor-pointer shadow-md hover:bg-neutral-900 active:scale-[0.98]"
          >
            {copiedSection === 'fullReport' ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      <section style={panelStyle} className="rounded-3xl p-6 relative">
        <div className="flex items-center justify-between border-b border-[#111814]/10 pb-3.5 mb-4 shrink-0">
          <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#111814] flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> The Big Picture
          </h3>
          <button
            onClick={() => copyToClipboard(result.summary, 'summaryOnly')}
            className="p-1 rounded text-[#111814]/60 hover:bg-[#111814]/5 hover:text-[#111814] transition-colors"
            title="Copy summary"
          >
            {copiedSection === 'summaryOnly' ? (
              <Check className="h-4 w-4 text-[#111814]" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
        
        <div className="prose max-w-none text-[#111814] leading-relaxed tracking-wide text-xs">
          {renderFormattedMarkdown(result.summary)}
        </div>
      </section>

      <section style={panelStyle} className="rounded-3xl p-6">
        <div className="flex items-center justify-between border-b border-[#111814]/10 pb-3.5 mb-4 shrink-0">
          <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#111814] flex items-center gap-1.5">
            Key Takeaways
          </h3>
          <button
            onClick={() => copyToClipboard(result.keyPoints.join('\n'), 'keyPoints')}
            className="p-1 rounded text-[#111814]/60 hover:bg-[#111814]/5 hover:text-[#111814] transition-colors"
            title="Copy all points"
          >
            {copiedSection === 'keyPoints' ? (
              <Check className="h-4 w-4 text-[#111814]" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
        
        {result.keyPoints.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {result.keyPoints.map((point, idx) => {
              const formattedIdx = String(idx + 1).padStart(2, '0');
              return (
                <div key={idx} className="flex gap-4 items-start p-3 bg-white/45 border border-[#111814]/10 rounded-2xl group">
                  <span className="font-mono text-sm font-black bg-[#111814] text-[#A1FFCE] px-2 py-0.5 rounded shadow-sm select-none">
                    {formattedIdx}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs text-[#111814] font-bold leading-relaxed">
                      {point}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#111814]/70 italic">No key points extracted.</p>
        )}
      </section>

      <section style={panelStyle} className="rounded-3xl p-6">
        <div className="flex items-center justify-between border-b border-[#111814]/10 pb-3.5 mb-4 shrink-0">
          <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#111814] flex items-center gap-1.5">
            What Could Be Stronger?
          </h3>
          <button
            onClick={() => copyToClipboard(result.improvementSuggestions.join('\n'), 'suggestions')}
            className="p-1 rounded text-[#111814]/60 hover:bg-[#111814]/5 hover:text-[#111814] transition-colors"
            title="Copy suggestions"
          >
            {copiedSection === 'suggestions' ? (
              <Check className="h-4 w-4 text-[#111814]" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
        
        {result.improvementSuggestions.length > 0 ? (
          <div className="space-y-3.5">
            {result.improvementSuggestions.map((suggestion, idx) => (
              <div 
                key={idx} 
                className="flex gap-4 rounded-2xl bg-white/55 p-4 border border-neutral-900/10 hover:border-neutral-900/25 transition-all shadow-sm"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#111814]/5 text-[#111814] border border-[#111814]/15 mt-0.5">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-[9px] font-extrabold text-[#111814]/65 uppercase tracking-widest">Feedback item {idx + 1}</h5>
                  <p className="mt-1 text-xs text-[#111814] leading-relaxed font-bold">{suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#111814]/70 italic">No document optimization suggestions available.</p>
        )}
      </section>

      <section style={panelStyle} className="rounded-3xl p-6">
        <div className="flex items-center justify-between border-b border-[#111814]/10 pb-3.5 mb-4 shrink-0">
          <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#111814]">
            Extracted Source Content
          </h3>
          <button
            onClick={() => setIsRawTextExpanded(!isRawTextExpanded)}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#111814]/70 hover:text-[#111814] transition-colors cursor-pointer"
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
          <div className="rounded-2xl border border-neutral-900/10 bg-white/45 p-4 shadow-inner animate-in slide-in-from-top-4 duration-300">
            <div className="relative w-full max-w-sm mb-4">
              <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-[#111814]/60" />
              <input
                type="text"
                placeholder="Search raw source content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border-2 border-[#111814] bg-white pl-9 pr-4 py-2.5 text-xs font-bold text-[#111814] placeholder-[#111814]/40 focus:outline-none"
              />
            </div>
            
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar bg-white/70 border border-[#111814]/15 p-4 rounded-xl">
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-[#111814] leading-relaxed font-bold">
                {getFilteredRawText()}
              </pre>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
