import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPdf } from '@/lib/pdf';
import { extractTextFromImage } from '@/lib/ocr';
import { summarizeDocument } from '@/lib/ai';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    let formData;
    try {
      formData = await request.formData();
    } catch (e) {
      return NextResponse.json(
        { error: 'Failed to process file upload. Invalid form data structure.' },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File | null;
    const lengthInput = formData.get('length') as string | null;
    const length = (lengthInput === 'short' || lengthInput === 'medium' || lengthInput === 'long') 
      ? lengthInput 
      : 'medium';

    if (!file) {
      return NextResponse.json(
        { error: 'No file was provided. Please select a PDF or image file.' },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `The selected file is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). The maximum allowed size is 10MB.` },
        { status: 400 }
      );
    }

    const mimeType = file.type || '';
    const name = file.name || 'document';
    const extension = name.split('.').pop()?.toLowerCase();
    
    let isPdf = mimeType === 'application/pdf' || extension === 'pdf';
    let isImage = ['image/png', 'image/jpeg', 'image/jpg'].includes(mimeType) || 
                  ['png', 'jpg', 'jpeg'].includes(extension || '');

    if (!isPdf && !isImage) {
      return NextResponse.json(
        { error: 'Unsupported file format. Only PDF documents and image files (PNG, JPG, JPEG) are accepted.' },
        { status: 400 }
      );
    }

    let fileBuffer: Buffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } catch (e) {
      return NextResponse.json(
        { error: 'Could not read file data. The file might be corrupted.' },
        { status: 400 }
      );
    }

    if (fileBuffer.length === 0) {
      return NextResponse.json(
        { error: 'The uploaded file is empty.' },
        { status: 400 }
      );
    }

    let extractedText = '';
    let pageCount = 1;

    if (isPdf) {
      try {
        const pdfResult = await extractTextFromPdf(fileBuffer);
        extractedText = pdfResult.text;
        pageCount = pdfResult.pages;
      } catch (pdfError: any) {
        return NextResponse.json(
          { error: pdfError?.message || 'We could not extract text from this PDF. It might be password-protected or corrupted.' },
          { status: 500 }
        );
      }
    } else {
      try {
        extractedText = await extractTextFromImage(fileBuffer);
        pageCount = 1;
      } catch (ocrError: any) {
        return NextResponse.json(
          { error: ocrError?.message || 'Optical Character Recognition (OCR) failed to read this image.' },
          { status: 500 }
        );
      }
    }

    const sanitizedText = extractedText.trim();
    if (!sanitizedText || sanitizedText.length < 15) {
      if (isPdf) {
        return NextResponse.json(
          { 
            error: 'No readable text was found in this PDF. It might be a scanned document, contain only images, or contain password protection. Please convert its pages to PNG/JPG images and upload them instead.',
            isScannedPdfFallback: true
          },
          { status: 422 }
        );
      } else {
        return NextResponse.json(
          { error: 'Optical Character Recognition (OCR) was unable to extract any readable text from this image. Please ensure the image is high-quality, clear, and contains English text.' },
          { status: 422 }
        );
      }
    }

    const characterCount = sanitizedText.length;
    const wordCount = sanitizedText.split(/\s+/).filter(Boolean).length;

    try {
      const summaryResult = await summarizeDocument(sanitizedText, length);
      
      return NextResponse.json({
        fileName: file.name,
        fileSize: file.size,
        pageCount,
        wordCount,
        characterCount,
        extractedText: sanitizedText,
        ...summaryResult
      });
    } catch (aiError: any) {
      console.error('AI Processing Error:', aiError);
      
      if (aiError?.message?.includes('API key') || !process.env.GEMINI_API_KEY) {
        return NextResponse.json(
          { error: 'The AI Summarization Service is currently unavailable because the API key is not configured. Please contact the administrator.' },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: aiError?.message || 'The AI service encountered an error generating the summary. Please try again.' },
        { status: 502 }
      );
    }
  } catch (globalError: any) {
    console.error('Global Route Error:', globalError);
    return NextResponse.json(
      { error: 'An unexpected server error occurred while processing your request. Please try again later.' },
      { status: 500 }
    );
  }
}
