import { createWorker } from 'tesseract.js';

/**
 * Performs OCR on an image buffer (PNG, JPEG, etc.) using Tesseract.js.
 * Automatically handles worker initialization and cleanup.
 */
export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  let worker;
  try {
    // Initialize worker with English language
    worker = await createWorker('eng');
    
    // Perform recognition on the image buffer
    const { data: { text } } = await worker.recognize(imageBuffer);
    
    // Clean up carriage returns
    return (text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  } catch (error: any) {
    console.error('Error during OCR processing:', error);
    throw new Error(
      error?.message || 'Optical Character Recognition (OCR) failed. The image might be blurry, low-quality, or corrupted.'
    );
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}
