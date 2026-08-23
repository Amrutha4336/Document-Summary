import path from 'path';
import { createWorker } from 'tesseract.js';

export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  let worker;
  try {
    const workerPath = path.resolve(process.cwd(), 'node_modules/tesseract.js/src/worker-script/node/index.js');
    worker = await createWorker('eng', undefined, {
      workerPath
    });
    const { data: { text } } = await worker.recognize(imageBuffer);
    return (text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  } catch (error: unknown) {
    console.error('Error during OCR processing:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      errorMessage || 'Optical Character Recognition (OCR) failed. The image might be blurry, low-quality, or corrupted.'
    );
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}
