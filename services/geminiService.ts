import { GoogleGenAI, Chat, Content, Part } from "@google/genai";
import { Message, KnowledgeItem } from '../types';
import { DEV_TALK_PERSONA } from '../constants';
import { processImage, processPdf } from "../utils/fileProcessor";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const model = 'gemini-2.5-flash';

function buildHistory(messages: Message[]): Content[] {
    return messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }] // History messages are text-only for now
    }));
}

export const getChatTitle = async (history: Message[]): Promise<string> => {
    if (!API_KEY) return "New Chat";
    try {
        const titlePrompt = `Based on the following conversation, create a short, descriptive title (4 words max). Conversation:\n\n${history.map(m => `${m.role}: ${m.text}`).join('\n')}`;
        const response = await ai.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: titlePrompt }] }],
        });
        return response.text.trim().replace(/"/g, '');
    } catch (error) {
        console.error("Error generating title:", error);
        return "New Chat";
    }
}

export const streamChatResponse = async (
  history: Message[],
  knowledgeBase: KnowledgeItem[],
  file: File | null,
  onChunk: (text: string) => void,
  onError: (error: Error) => void
) => {
  if (!API_KEY) {
    const errorMsg = "API Key is not configured. Please set the environment variable.";
    onChunk(errorMsg);
    onError(new Error(errorMsg));
    return;
  }

  const knowledgeContext = knowledgeBase.length > 0
    ? `Remember the following user context:\n- ${knowledgeBase.join('\n- ')}\n\n`
    : '';
  
  const systemInstruction = `${DEV_TALK_PERSONA}\n\n${knowledgeContext}`;

  try {
    const chat: Chat = ai.chats.create({
      model: model,
      history: buildHistory(history.slice(0, -1)),
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const lastMessage = history[history.length - 1];
    let userPrompt = lastMessage.text;
    const parts: Part[] = [];

    if (file) {
        if (file.type.startsWith('image/')) {
            const dataUrl = await processImage(file);
            const base64Data = dataUrl.split(',')[1];
            parts.push({
                inlineData: {
                    mimeType: file.type,
                    data: base64Data,
                }
            });
        } else if (file.type === 'application/pdf') {
            const { text: pdfText } = await processPdf(file);
            userPrompt = `Based on the following content from the PDF "${file.name}", answer my question.\n\nPDF CONTENT:\n---\n${pdfText}\n---\n\nMY QUESTION: ${userPrompt}`;
        }
    }
    
    parts.push({ text: userPrompt });

    const result = await chat.sendMessageStream({ message: parts });

    for await (const chunk of result) {
      onChunk(chunk.text);
    }
  } catch (error) {
    console.error("Error streaming chat response:", error);
    const err = error instanceof Error ? error : new Error(String(error));
    onChunk(`\n\n**Error:** ${err.message}`);
    onError(err);
  }
};