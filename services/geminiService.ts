import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const apiKey = process.env.API_KEY;

// Initialize the client via the specific constructor pattern required
const ai = new GoogleGenAI({ apiKey: apiKey });

export const analyzeImage = async (base64Data: string, mimeType: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

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
            description: { type: Type.STRING, description: "Short explanation of similar facial features in Korean" },
            celebrityType: { type: Type.STRING, description: "Occupation in Korean" }
          },
          required: ["rank", "name", "similarity", "description", "celebrityType"]
        }
      },
      overallComment: {
        type: Type.STRING,
        description: "A fun and encouraging overall comment in Korean."
      }
    },
    required: ["matches", "overallComment"]
  };

  const prompt = `
    Analyze the facial features in this image carefully. 
    Find the top 5 celebrity lookalikes.
    
    IMPORTANT: Focus primarily on Korean celebrities (K-Pop Idols, Actors, Singers, Athletes) unless the user's features are clearly non-Asian.
    
    For each match, provide:
    1. rank: 1 to 5.
    2. name: The celebrity's name in Korean (Hangul). Use the most common public name (e.g., '아이유' instead of '이지은', '차은우' instead of '이동민').
    3. similarity: Similarity percentage (0-100). Be realistic but generous.
    4. description: A short, specific description of shared facial features (eyes, nose, jawline, mood) in Korean.
    5. celebrityType: Their profession in Korean (e.g., 배우, 아이돌, 가수, 모델).
    
    overallComment: A fun, witty, and encouraging overall comment about the user's appearance in Korean.
    
    Return the result strictly in JSON format matching the schema.
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
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7, // Slightly creative but grounded
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini.");
    }

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("이미지를 분석하는 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
};