export interface SummarizationResponse {
  summary: string;
  keyPoints: string[];
  improvementSuggestions: string[];
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

function chunkText(text: string, chunkSize: number = 10000, overlap: number = 1500): string[] {
  const chunks: string[] = [];
  let index = 0;

  if (text.length <= chunkSize) {
    return [text];
  }

  while (index < text.length) {
    const end = Math.min(index + chunkSize, text.length);
    chunks.push(text.slice(index, end));
    if (end === text.length) {
      break;
    }
    index += chunkSize - overlap;
  }

  return chunks;
}

async function summarizeChunk(chunk: string, chunkIndex: number, totalChunks: number, apiKey: string): Promise<string> {
  const prompt = `You are an expert editor. Summarize the following section (${chunkIndex}/${totalChunks}) of a larger document. Focus on retaining core facts, key terms, and main concepts. Do not add outside information.
  
Document Section:
"""
${chunk}
"""`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini Chunk Summarization failed: ${response.status}`, errText);
      throw new Error(`Gemini chunk summary API failed with status ${response.status}`);
    }

    const json = await response.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error(`Error summarizing chunk ${chunkIndex}:`, error);
    return chunk.slice(0, 1000);
  }
}

async function generateStructuredSummary(
  text: string,
  length: 'short' | 'medium' | 'long',
  apiKey: string
): Promise<SummarizationResponse> {
  let lengthInstruction = '';
  switch (length) {
    case 'short':
      lengthInstruction = 'Generate a very brief, concise summary of 2 to 3 sentences. Highlight only the absolute core takeaway message.';
      break;
    case 'medium':
      lengthInstruction = 'Generate a balanced, medium-length summary of 2 to 3 well-structured paragraphs. Keep the key context and primary conclusions intact.';
      break;
    case 'long':
      lengthInstruction = 'Generate a comprehensive, detailed summary of 4 or more detailed paragraphs. Capture major sections, secondary arguments, and thorough context.';
      break;
  }

  const prompt = `You are a professional research analyst and document auditor. 
Analyze the provided document text and generate a structured response containing:
1. A summary matching the length guidelines.
2. A list of key points / main ideas.
3. Useful, actionable suggestions for improving the document (e.g., missing details, vague sentences, logical gaps, structural enhancements, content expansion). Ensure recommendations are directly derived from the document content.

Length Guideline:
${lengthInstruction}

Document Content:
"""
${text}
"""`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            summary: {
              type: 'STRING',
              description: 'A markdown-formatted summary of the document, matching the requested length.'
            },
            keyPoints: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'A list of 4-10 key points or main ideas extracted from the document.'
            },
            improvementSuggestions: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'A list of 3-8 actionable improvement suggestions directly based on the document content.'
            }
          },
          required: ['summary', 'keyPoints', 'improvementSuggestions']
        }
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.ok ? '' : await response.text();
    throw new Error(`Gemini API failed with status ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textResponse) {
    throw new Error('Gemini API returned an empty response.');
  }

  try {
    const parsed: SummarizationResponse = JSON.parse(textResponse);
    return {
      summary: parsed.summary || 'Summary could not be generated.',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      improvementSuggestions: Array.isArray(parsed.improvementSuggestions) ? parsed.improvementSuggestions : []
    };
  } catch (error) {
    console.error('Failed to parse Gemini structured JSON:', textResponse, error);
    throw new Error('Invalid JSON response format returned by the AI provider.');
  }
}

export async function summarizeDocument(
  text: string,
  length: 'short' | 'medium' | 'long' = 'medium'
): Promise<SummarizationResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set the GEMINI_API_KEY in your environment variables.');
  }

  if (!text || text.trim().length === 0) {
    throw new Error('No text was provided for summarization.');
  }

  const MAX_CHARACTER_LIMIT = 12000;

  if (text.length > MAX_CHARACTER_LIMIT) {
    const chunks = chunkText(text, 10000, 1500);

    const chunkSummaries = await Promise.all(
      chunks.map((chunk, index) => summarizeChunk(chunk, index + 1, chunks.length, apiKey))
    );

    const combinedSummaries = chunkSummaries.filter(Boolean).join('\n\n');
    return generateStructuredSummary(combinedSummaries, length, apiKey);
  }
  return generateStructuredSummary(text, length, apiKey);
}
