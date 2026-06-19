import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

export interface LLMResponse {
  content: string;
  modelUsed: "gemini" | "groq";
}

export async function callLLM(
  prompt: string,
  systemInstruction?: string,
  forceFallback: boolean = false
): Promise<LLMResponse> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (forceFallback) {
    if (!groqKey) {
      throw new Error("Groq API key is missing (forceFallback is enabled)");
    }
    return callGroq(prompt, systemInstruction, groqKey);
  }

  // Try Gemini first if key exists
  if (geminiKey) {
    try {
      // Check if we are using the new @google/genai SDK or @google/generative-ai
      // With @google/genai, client is instantiated as `new GoogleGenAI({ apiKey })`
      // and model is called via client.models.generateContent({ model, contents })
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: systemInstruction
          ? {
              systemInstruction: systemInstruction,
              temperature: 0.1,
            }
          : {
              temperature: 0.1,
            },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Gemini returned empty response text");
      }

      return {
        content: text,
        modelUsed: "gemini",
      };
    } catch (error) {
      console.warn("Gemini API call failed, attempting fallback to Groq. Error:", error);
      if (!groqKey) {
        throw new Error(`Gemini failed and Groq API key is missing. Original error: ${String(error)}`);
      }
      return callGroq(prompt, systemInstruction, groqKey);
    }
  }

  // If Gemini key is missing, fall back to Groq directly
  if (groqKey) {
    console.info("Gemini API key missing, routing directly to Groq.");
    return callGroq(prompt, systemInstruction, groqKey);
  }

  throw new Error("Neither GEMINI_API_KEY nor GROQ_API_KEY is configured in the environment.");
}

export const llm = {
  callLLM,
};

async function callGroq(
  prompt: string,
  systemInstruction: string | undefined,
  apiKey: string
): Promise<LLMResponse> {
  try {
    const groq = new Groq({ apiKey });
    const messages: Array<{ role: "system" | "user"; content: string }> = [];

    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const completion = await groq.chat.completions.create({
      messages,
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      throw new Error("Groq returned empty response content");
    }

    return {
      content: text,
      modelUsed: "groq",
    };
  } catch (error) {
    console.error("Groq API call failed as well. Error:", error);
    throw new Error(`Groq API call failed. Error: ${String(error)}`);
  }
}
