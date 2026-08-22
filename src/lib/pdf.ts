import { extractText, getDocumentProxy } from 'unpdf';

export interface PdfExtractionResult {
  text: string;
  pages: number;
}

export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<PdfExtractionResult> {
  try {
    const dataArray = new Uint8Array(pdfBuffer);
    const pdf = await getDocumentProxy(dataArray);
    const { totalPages, text } = await extractText(pdf, { mergePages: true });
    
    let cleanedText = text || '';
    cleanedText = cleanedText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    return {
      text: cleanedText,
      pages: totalPages || 1,
    };
  } catch (error: any) {
    console.error('Error parsing PDF with unpdf:', error);
    throw new Error(
      error?.message || 'We couldn\'t extract text from this PDF. The file may be corrupted or contain unsupported content.'
    );
  }
}
