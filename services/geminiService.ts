import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeImage = async (base64Data: string, mimeType: string): Promise<AnalysisResult> => {
  // Initialize the client with the API key.
  const apiKey = (import.meta as any).env?.VITE_API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : undefined);

  if (!apiKey) {
    throw new Error("API Key 설정이 필요합니다.");
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
            rank: { type: Type.INTEGER, description: "순위 (1~5위)" },
            name: { type: Type.STRING, description: "닮은 유명인 이름 (한국어)" },
            similarity: { type: Type.INTEGER, description: "싱크로율 (0-100)" },
            description: { type: Type.STRING, description: "닮은 이유에 대한 구체적이고 세련된 분석 (얼굴형, 분위기 등)" },
            celebrityType: { type: Type.STRING, description: "직업 또는 타이틀 (예: 배우, 아이돌, 모델)" }
          },
          required: ["rank", "name", "similarity", "description", "celebrityType"]
        }
      },
      overallComment: {
        type: Type.STRING,
        description: "전체적인 이미지와 분위기에 대한 한 줄 총평"
      }
    },
    required: ["matches", "overallComment"]
  };

  const systemInstruction = `
    당신은 전문적인 'AI 이미지 컨설턴트'입니다.
    사용자의 사진을 분석하여 닮은 유명인을 찾고, 그 이유를 얼굴의 특징(눈매, 얼굴형, 분위기 등)에 기반하여 설명해 주세요.
    
    가이드라인:
    1. **어조:** 정중하고 세련된 어조를 사용하세요. (해요체 사용, 이모지는 절제하여 사용)
    2. **대상:** 한국에서 인지도가 높은 연예인(배우, 가수, 모델) 위주로 선정하세요.
    3. **분석 내용:** 단순히 "닮았다"가 아니라, "사슴 같은 맑은 눈망울이 닮았습니다", "전체적으로 도시적이고 세련된 분위기가 비슷합니다"와 같이 구체적으로 서술하세요.
    4. **직업 표기:** '배우', '가수' 등 간결하게 표기하거나 '감성 보컬', '천만 배우' 등 수식어를 붙여도 좋습니다.
    5. **싱크로율:** 사용자가 기분 좋을 수 있도록 70~98% 사이에서 적절히 높은 수치를 부여하세요.
    6. **총평:** 사용자의 매력을 칭찬하는 긍정적이고 기분 좋은 한 줄 요약을 제공하세요.
    
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
            text: "이 사람과 닮은 연예인을 분석해줘."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: systemInstruction,
        temperature: 0.5, // 0.5 for more balanced/realistic results
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("분석 결과를 받아오지 못했습니다.");
    }

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    
    if (errorMessage.includes("API key") || errorMessage.includes("403") || errorMessage.includes("401")) {
      throw new Error("API 키 오류입니다. 관리자에게 문의하세요.");
    }
    
    throw new Error(`분석 중 오류가 발생했습니다: ${errorMessage}`);
  }
};