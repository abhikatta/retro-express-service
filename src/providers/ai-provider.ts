import { AIRetroItemGroupEvent } from "@/services/websocket.js";
import { GoogleGenAI } from "@google/genai";

export const promptAI = async (
  contents: string,
): Promise<AIRetroItemGroupEvent["itemGroups"]> => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents,
  });
  return (
    JSON.parse(response.candidates?.[0].content?.parts?.[0].text || "") ?? {
      summary: "",
      groupedItemIds: [],
    }
  );
};
