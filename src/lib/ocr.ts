import { createWorker } from 'tesseract.js';

export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  let worker;
  try {
    worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(imageBuffer);
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
