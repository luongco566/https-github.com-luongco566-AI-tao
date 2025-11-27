import { GoogleGenAI, Type } from "@google/genai";
import { GraphData, InfographicItem } from "../types";

// Initialize the API client
// Note: process.env.API_KEY is assumed to be available
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizeText = async (text: string): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Bạn là một trợ lý AI hữu ích. Hãy tóm tắt văn bản sau đây bằng tiếng Việt một cách ngắn gọn, súc tích, nêu bật các ý chính.
    
    Văn bản:
    ${text}`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Không thể tạo tóm tắt.";
  } catch (error) {
    console.error("Summarization error:", error);
    throw error;
  }
};

export const generateMindMapData = async (text: string): Promise<GraphData> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Dựa trên văn bản tóm tắt sau, hãy tạo cấu trúc JSON cho một sơ đồ tư duy (mind map).
    Nút trung tâm (id="root") nên là chủ đề chính.
    Các nút con nên là các ý chính.
    Văn bản tóm tắt: ${text}`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  group: { type: Type.INTEGER, description: "1 for root, 2 for main branches, 3 for leaves" }
                },
                required: ["id", "label", "group"]
              }
            },
            links: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING, description: "ID of source node" },
                  target: { type: Type.STRING, description: "ID of target node" }
                },
                required: ["source", "target"]
              }
            }
          },
          required: ["nodes", "links"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned");
    
    return JSON.parse(jsonText) as GraphData;
  } catch (error) {
    console.error("Mind map generation error:", error);
    throw error;
  }
};

export const generateInfographicData = async (text: string): Promise<InfographicItem[]> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Analyze the following text and create a list of 4 to 6 key insights for an infographic summary.
    For each insight, provide:
    1. A short, catchy title (max 5 words, in Vietnamese).
    2. A concise description (max 15 words, in Vietnamese).
    3. An icon category that best fits the insight. Choose strictly from: 'chart', 'bulb', 'users', 'globe', 'time', 'shield', 'target'.

    Text: ${text}`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              icon: { type: Type.STRING, enum: ['chart', 'bulb', 'users', 'globe', 'time', 'shield', 'target'] }
            },
            required: ["title", "description", "icon"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned");

    return JSON.parse(jsonText) as InfographicItem[];
  } catch (error) {
    console.error("Infographic generation error:", error);
    throw error;
  }
};