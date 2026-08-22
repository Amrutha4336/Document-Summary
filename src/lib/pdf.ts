import { PDFParse } from 'pdf-parse';
import path from 'path';
import { pathToFileURL } from 'url';
import fs from 'fs';

try {
  const workerPath = path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.mjs');
  if (fs.existsSync(workerPath)) {
    const workerUrl = pathToFileURL(workerPath).href;
    PDFParse.setWorker(workerUrl);
    console.log('PDF Parse worker configured with local path:', workerUrl);
  } else {
    const cdnUrl = 'https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs';
    PDFParse.setWorker(cdnUrl);
    console.log('PDF Parse worker configured with CDN fallback:', cdnUrl);
  }
} catch (e) {
  console.error('Failed to configure PDF Parse worker path:', e);
}

export interface PdfExtractionResult {
  text: string;
  pages: number;
}

export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<PdfExtractionResult> {
  let parser;
  try {
    const dataArray = new Uint8Array(pdfBuffer);
    parser = new PDFParse({ data: dataArray });
    const textResult = await parser.getText();
    let cleanedText = textResult.text || '';
    cleanedText = cleanedText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    return {
      text: cleanedText,
      pages: textResult.pages?.length || 1,
    };
  } catch (error: any) {
    console.error('Error parsing PDF:', error);
    throw new Error(
      error?.message || 'We couldn\'t extract text from this PDF. The file may be corrupted or contain unsupported content.'
    );
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch (destroyError) {
        console.error('Error cleaning up PDF parser instance:', destroyError);
      }
    }
  }
}
