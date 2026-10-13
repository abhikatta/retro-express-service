import { GoogleGenAI } from "@google/genai";

export const promptAI = async (
  contents: string,
): Promise<string | undefined> => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    throw new Error("API key not found!");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents,
    });

    return res.text;
  } catch (error) {
    console.error(error);
    throw new Error("Something went wrong! Please try again later.");
  }
};
