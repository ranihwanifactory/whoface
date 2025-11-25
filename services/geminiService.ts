import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeImage = async (base64Data: string, mimeType: string): Promise<AnalysisResult> => {
  // Initialize the client with the API key.
  const apiKey = (import.meta as any).env?.VITE_API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : undefined);

  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration (VITE_API_KEY or API_KEY).");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Define the JSON schema for the response
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      matches: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            rank: { type: Type.INTEGER, description: "Rank from 1 to 5" },
            name: { type: Type.STRING, description: "Name of the celebrity in Korean" },
            similarity: { type: Type.INTEGER, description: "Similarity percentage (0-100)" },
            description: { type: Type.STRING, description: "Fun explanation for kids (e.g., comparing to cute animals or hero traits)" },
            celebrityType: { type: Type.STRING, description: "Occupation or Title (e.g., 'Singing Princess', 'Cool Hero')" }
          },
          required: ["rank", "name", "similarity", "description", "celebrityType"]
        }
      },
      overallComment: {
        type: Type.STRING,
        description: "A magical and exciting comment for a child."
      }
    },
    required: ["matches", "overallComment"]
  };

  const systemInstruction = `
    You are a 'Magic Mirror' in a fantasy game world for kids.
    Your task is to look at the child's (or user's) photo and find their celebrity lookalikes in a fun, encouraging, and gamified way.
    
    GUIDELINES:
    1. **Tone:** Super enthusiastic, magical, and kind. Use emojis! 🌟✨
    2. **Lookalikes:** Focus on K-Pop Idols (very popular with kids), actors, or animated character-like vibes if applicable.
    3. **Description:** Do NOT use complex physiognomy terms. Use comparisons kids understand:
       - "puppy eyes" (강아지 같은 눈망울)
       - "shining smile" (반짝반짝 미소)
       - "prince/princess vibes" (왕자님/공주님 분위기)
    4. **CelebrityType:** Instead of just "Actor", use cool titles like "Drama Hero (드라마 주인공)", "Dancing Fairy (춤추는 요정)", "Stage King (무대 위의 왕)".
    5. **Similarity:** Be generous! Give high scores to make them happy (80-99%).
    6. **Overall Comment:** Celebrate their look! E.g., "Wow! You look like a main character!" (우와! 동화 속 주인공 같아요!)
    
    Output must be valid JSON matching the provided schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Who does this person look like? Tell me in a fun way!"
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: systemInstruction,
        temperature: 0.7, // Higher creativity for fun responses
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini.");
    }

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    
    if (errorMessage.includes("API key") || errorMessage.includes("403") || errorMessage.includes("401")) {
      throw new Error("마법 열쇠(API Key)가 없어요! 설정을 확인해주세요.");
    }
    
    throw new Error(`마법 거울이 잠시 쉬고 있어요: ${errorMessage}`);
  }
};