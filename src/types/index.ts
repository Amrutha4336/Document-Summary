export type SummaryLength = 'short' | 'medium' | 'long';

export type ProcessingStep = 
  | 'idle' 
  | 'uploading' 
  | 'extracting' 
  | 'ocr' 
  | 'summarizing' 
  | 'success' 
  | 'error';

export interface SummaryResult {
  fileName: string;
  fileSize: number;
  pageCount: number;
  wordCount: number;
  characterCount: number;
  extractedText: string;
  summary: string;
  keyPoints: string[];
  improvementSuggestions: string[];
}

export interface ProcessingError {
  message: string;
  isScannedPdfFallback?: boolean;
}
