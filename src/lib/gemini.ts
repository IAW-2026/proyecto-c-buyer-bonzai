import 'server-only';

import { GoogleGenAI } from '@google/genai';

const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';

let geminiClient: GoogleGenAI | null = null;

export function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  geminiClient ??= new GoogleGenAI({ apiKey });

  return geminiClient;
}
