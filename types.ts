export interface CelebrityMatch {
  rank: number;
  name: string;
  similarity: number;
  description: string;
  celebrityType: string;
}

export interface AnalysisResult {
  matches: CelebrityMatch[];
  overallComment: string;
}

export interface ImageFile {
  file: File;
  preview: string;
  base64: string; // Pure base64 without prefix
  mimeType: string;
}
