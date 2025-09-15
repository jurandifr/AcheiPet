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

    // Using the same prompt structure as user's working model
    const promptText = `
    Verifique a imagem e responda caso consiga identificar,
    o tipo de animal e a raça, caso não tenha certeza informe
    'não identificado' no campo equivalente.
    Dica: O animal é um pet.
    [{ 'tipo':<animal>, 'raça':<raça> }]`;

    const contents = [
      {
        inlineData: {
          data: imageBytes.toString("base64"),
          mimeType: "image/jpeg",
        },
      },
      promptText,
    ];

    // Using the model specified in user's working code
    const response = await ai.models.generateContent({
      model: "models/gemma-3-12b-it",
      contents: contents,
    });

    const rawText = response.text;

    if (rawText) {
      console.log("Raw AI response:", rawText);
      
      // Try to extract JSON from the response
      let parsed;
      try {
        // Look for JSON in the response text
        const jsonMatch = rawText.match(/\[?\s*\{\s*['"]\s*tipo['"]\s*:\s*['"](.*?)['"]\s*,\s*['"]\s*ra[çc]a['"]\s*:\s*['"](.*?)['"]\s*\}\s*\]?/i);
        if (jsonMatch) {
          parsed = {
            tipo: jsonMatch[1],
            raca: jsonMatch[2]
          };
        } else {
          // Try direct JSON parsing
          parsed = JSON.parse(rawText);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed = parsed[0];
          }
        }
      } catch {
        // Fallback parsing for simpler responses
        const tipoMatch = rawText.match(/tipo['"]\s*:\s*['"](.*?)['"]/i);
        const racaMatch = rawText.match(/ra[çc]a['"]\s*:\s*['"](.*?)['"]/i);
        
        if (tipoMatch && racaMatch) {
          parsed = {
            tipo: tipoMatch[1],
            raca: racaMatch[1]
          };
        }
      }

      if (parsed && parsed.tipo && parsed.raca) {
        let data: AnimalAnalysis = {
          tipo: "Outro",
          raca: "SRD"
        };

        // Normalize tipo
        const tipoLower = parsed.tipo.toLowerCase();
        if (tipoLower.includes('cão') || tipoLower.includes('cao') || tipoLower.includes('cachorro') || tipoLower.includes('dog')) {
          data.tipo = "Cão";
        } else if (tipoLower.includes('gato') || tipoLower.includes('cat')) {
          data.tipo = "Gato";
        } else {
          data.tipo = "Outro";
        }

        // Normalize raca
        if (parsed.raca && parsed.raca.toLowerCase() !== 'não identificado' && parsed.raca.toLowerCase() !== 'nao identificado') {
          data.raca = parsed.raca;
        } else {
          data.raca = "SRD";
        }

        console.log("Parsed AI analysis:", data);
        return data;
      }
    }

    throw new Error("Could not parse AI response");
  } catch (error) {
    console.error("Failed to analyze animal image:", error);
    
    // Return default values if AI analysis fails
    return {
      tipo: "Outro",
      raca: "SRD"
    };
  }
}
