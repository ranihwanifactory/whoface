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

  const systemInstruction = `
    You are an expert AI stylist and face physiognomy analyst specializing in Korean entertainment.
    Your task is to analyze the facial features of the uploaded image and identify the top 5 celebrity lookalikes.
    
    GUIDELINES:
    1. Focus primarily on Korean celebrities (K-Pop Idols, Actors, Singers, Athletes) unless the user's features are clearly non-Asian.
    2. Be observant of specific facial features: eye shape, nose bridge, jawline, and overall aura.
    3. Be generous but realistic with similarity scores (typically between 70% and 99%).
    4. Provide the "name" strictly in Korean (Hangul).
    5. The "description" should be a specific, flattering comment about shared features (e.g., "사슴 같은 눈망울이 닮았어요", "오똑한 콧날이 비슷해요").
    6. The "overallComment" should be witty, fun, and encouraging, written in a friendly Korean tone.
    
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
            text: "Analyze this face and find the top 5 celebrity lookalikes."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: systemInstruction,
        temperature: 0.5, // Balanced for creativity and structure
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini.");
    }

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("이미지를 분석하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
};