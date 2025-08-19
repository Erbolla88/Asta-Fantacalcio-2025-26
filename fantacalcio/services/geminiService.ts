import { GoogleGenAI, Type } from "@google/genai";
import { Player } from '../types';
import { useTranslation } from "../lib/i18n";

// Safely access the API key in a browser environment
const API_KEY = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "fallback_key" });

const playerListSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'Player full name' },
      role: { type: Type.STRING, description: "Player's role: 'P', 'D', 'C', or 'A'" },
      club: { type: Type.STRING, description: 'Player club from the provided list' },
      baseValue: { type: Type.INTEGER, description: 'Base auction value between 1 and 100' },
    },
    required: ["name", "role", "club", "baseValue"],
  },
};

export const generatePlayerList = async (clubs: readonly string[], t: (key: any, params?: any) => string): Promise<Player[]> => {
  if (!API_KEY) {
    throw new Error(t('errorGeminiApiKey'));
  }
  try {
    const clubList = clubs.join(', ');
    const prompt = t('geminiPrompt', { clubList });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: playerListSchema,
        },
    });

    const jsonString = response.text.trim();
    const generatedPlayers = JSON.parse(jsonString);
    
    return generatedPlayers.map((p: any, index: number) => ({
      ...p,
      id: `${p.name.replace(/\s/g, '-')}-${index}`,
    }));

  } catch (error) {
    console.error("Error generating player list with Gemini:", error);
    throw new Error(t('errorGeminiGenerate'));
  }
};