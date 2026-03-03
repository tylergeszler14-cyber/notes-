import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { Source, ChatMessage, NotebookGuide, SourceType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateSummary(source: Source): Promise<{ summary: string; keywords: string[] }> {
  const model = "gemini-3-flash-preview";
  let contents: any;

  if (source.type === SourceType.PDF || source.type === SourceType.DOC) {
    contents = {
      parts: [
        { inlineData: { data: source.content, mimeType: source.mimeType || "application/pdf" } },
        { text: "Provide a concise summary of this document and extract 5-7 key keywords or concepts. Return in JSON format with 'summary' and 'keywords' fields." }
      ]
    };
  } else {
    contents = `Summarize this content and extract 5-7 key keywords or concepts: ${source.content}. Return in JSON format with 'summary' and 'keywords' fields.`;
  }

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '{"summary": "No summary", "keywords": []}');
  } catch {
    return { summary: response.text || "No summary", keywords: [] };
  }
}

export async function askQuestion(
  question: string,
  sources: Source[],
  history: ChatMessage[]
): Promise<ChatMessage> {
  const model = "gemini-3-flash-preview";
  
  const sourceParts = sources.map(s => {
    if (s.type === SourceType.PDF || s.type === SourceType.DOC) {
      return { inlineData: { data: s.content, mimeType: s.mimeType || "application/pdf" } };
    }
    return { text: `Source: ${s.name}\nContent: ${s.content}` };
  });

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        ...sourceParts,
        { text: `You are a research assistant. Answer the user's question based ONLY on the provided sources. If the answer is not in the sources, say you don't know. 
        Provide citations for your answers in the format [Source Name].
        
        User Question: ${question}` }
      ]
    },
    config: {
      temperature: 0.1, // Low temperature for grounding
    }
  });

  return {
    id: Math.random().toString(36).substring(7),
    role: 'model',
    text: response.text || "I couldn't find an answer in the provided sources.",
  };
}

export async function generateNotebookGuide(sources: Source[]): Promise<NotebookGuide> {
  const model = "gemini-3-flash-preview";
  
  const sourceParts = sources.map(s => {
    if (s.type === SourceType.PDF || s.type === SourceType.DOC) {
      return { inlineData: { data: s.content, mimeType: s.mimeType || "application/pdf" } };
    }
    return { text: `Source: ${s.name}\nContent: ${s.content}` };
  });

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        ...sourceParts,
        { text: "Generate a notebook guide based on these sources. Include a list of FAQs, a timeline of events (if applicable), and a table of contents. Return the result in JSON format." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          faq: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING }
              }
            }
          },
          timeline: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                event: { type: Type.STRING }
              }
            }
          },
          tableOfContents: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generateAudioOverview(text: string): Promise<string> {
  const model = "gemini-2.5-flash-preview-tts";
  
  const prompt = `TTS the following conversation between two AI hosts, Alex and Sam, discussing the research notes. Alex is enthusiastic and Sam is more analytical.
  
  Notes: ${text}`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            { speaker: 'Alex', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
            { speaker: 'Sam', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
          ]
        }
      }
    }
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
}
