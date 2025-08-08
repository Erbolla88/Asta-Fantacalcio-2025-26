import { GoogleGenAI, Type } from "@google/genai";
import { Player } from '../types';

if (!process.env.API_KEY) {
  console.warn("Variabile d'ambiente API_KEY non impostata. Le funzionalità di Gemini saranno disabilitate.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "fallback_key" });

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

export const generatePlayerList = async (clubs: readonly string[]): Promise<Player[]> => {
  if (!process.env.API_KEY) {
    throw new Error("La chiave API di Gemini non è configurata.");
  }
  try {
    const clubList = clubs.join(', ');
    const prompt = `Genera una lista di 40 giocatori per un'asta del Fantacalcio Serie A 2025/26. Per ogni giocatore, fornisci il nome, il ruolo ('P', 'D', 'C', o 'A'), un club e un valore base d'asta. Il club deve essere uno dei seguenti: ${clubList}. Crea una lista eterogenea con un buon mix di ruoli.`;

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
    console.error("Errore durante la generazione della lista giocatori con Gemini:", error);
    throw new Error("Impossibile generare la lista dei giocatori. Controlla la chiave API e riprova.");
  }
};