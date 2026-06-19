import { NextResponse } from "next/server";
import { Client as NotionClient } from "@notionhq/client";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, key, extraId } = body;

    if (type === "notion") {
      if (!key || !extraId) {
        return NextResponse.json({ success: false, message: "Missing Notion Key or Database ID." });
      }
      try {
        const notion = new NotionClient({ auth: key });
        // Retrieve database metadata to check connectivity
        await notion.databases.retrieve({ database_id: extraId });
        return NextResponse.json({ success: true, message: "Successfully connected to Notion database!" });
      } catch (error) {
        return NextResponse.json({ success: false, message: `Notion error: ${String(error)}` });
      }
    }

    if (type === "gemini") {
      if (!key) {
        return NextResponse.json({ success: false, message: "Missing Gemini API Key." });
      }
      try {
        const ai = new GoogleGenAI({ apiKey: key });
        await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: "ping",
        });
        return NextResponse.json({ success: true, message: "Gemini API key is valid and connected!" });
      } catch (error) {
        return NextResponse.json({ success: false, message: `Gemini error: ${String(error)}` });
      }
    }

    if (type === "groq") {
      if (!key) {
        return NextResponse.json({ success: false, message: "Missing Groq API Key." });
      }
      try {
        const groq = new Groq({ apiKey: key });
        await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: "ping" }],
        });
        return NextResponse.json({ success: true, message: "Groq API key is valid and connected!" });
      } catch (error) {
        return NextResponse.json({ success: false, message: `Groq error: ${String(error)}` });
      }
    }

    return NextResponse.json({ success: false, message: "Unknown test connection target." });
  } catch (error) {
    console.error("Test connection failed:", error);
    return NextResponse.json({ success: false, message: `Server error: ${String(error)}` }, { status: 500 });
  }
}
