import { GoogleGenAI } from "@google/genai";

export function getGeminiApiKey(): string {
  // These are replaced at build time by Vite's define
  const key1 = process.env.GEMINI_API_KEY;
  const key2 = process.env.VITE_GEMINI_API_KEY;
  
  // Standard Vite env variables (loaded via import.meta.env)
  // We configured envPrefix: ['VITE_', 'GEMINI_'] in vite.config.ts
  const key3 = import.meta.env.VITE_GEMINI_API_KEY;
  const key4 = import.meta.env.GEMINI_API_KEY;
  
  const finalKey = key1 || key2 || key3 || key4 || '';
  
  if (!finalKey) {
    console.warn("Gemini API Key not found in any environment variable (GEMINI_API_KEY, VITE_GEMINI_API_KEY)");
  }
  
  return finalKey;
}

export function createAiInstance() {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}
