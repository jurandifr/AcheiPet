import * as fs from "fs";
import { GoogleGenAI } from "@google/genai";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnimalAnalysis {
  tipo: "Cão" | "Gato" | "Outro";
  raca: string;
}

export async function analyzeAnimalImage(imagePath: string): Promise<AnimalAnalysis> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }

    const imageBytes = fs.readFileSync(imagePath);

    const systemPrompt = `Você é um especialista em identificação de animais. 
Analise a imagem do animal e retorne APENAS um objeto JSON com as chaves 'tipo' e 'raca'.

Para 'tipo', use apenas um destes valores:
- "Cão" para cachorros
- "Gato" para gatos  
- "Outro" para qualquer outro animal

Para 'raca':
- Se conseguir identificar a raça específica, retorne o nome da raça
- Se não conseguir identificar, retorne "SRD" (Sem Raça Definida)

Responda APENAS com o JSON, sem texto adicional.`;

    const contents = [
      {
        inlineData: {
          data: imageBytes.toString("base64"),
          mimeType: "image/jpeg",
        },
      },
      `Analise esta imagem de animal e retorne apenas um objeto JSON com as chaves 'tipo' (valores possíveis: 'Cão', 'Gato', 'Outro') e 'raca'. Se a raça não for identificável, retorne 'SRD' (Sem Raça Definida).`,
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            tipo: {
              type: "string",
              enum: ["Cão", "Gato", "Outro"]
            },
            raca: { 
              type: "string" 
            },
          },
          required: ["tipo", "raca"],
        },
      },
      contents: contents,
    });

    const rawJson = response.text;

    if (rawJson) {
      const data: AnimalAnalysis = JSON.parse(rawJson);
      
      // Validate the response structure
      if (!data.tipo || !data.raca) {
        throw new Error("Invalid response structure from AI");
      }
      
      // Ensure tipo is one of the allowed values
      if (!["Cão", "Gato", "Outro"].includes(data.tipo)) {
        console.warn(`Unexpected animal type: ${data.tipo}, defaulting to 'Outro'`);
        data.tipo = "Outro";
      }
      
      return data;
    } else {
      throw new Error("Empty response from Gemini AI");
    }
  } catch (error) {
    console.error("Failed to analyze animal image:", error);
    
    // Return default values if AI analysis fails
    return {
      tipo: "Outro",
      raca: "SRD"
    };
  }
}
