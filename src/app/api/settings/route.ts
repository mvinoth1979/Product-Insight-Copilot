import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    keys: {
      gemini: !!process.env.GEMINI_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
      notion: !!process.env.NOTION_API_KEY && !!process.env.NOTION_DATABASE_ID,
      gmail: !!process.env.GMAIL_CLIENT_ID && !!process.env.GMAIL_CLIENT_SECRET && !!process.env.GMAIL_REFRESH_TOKEN,
    },
  });
}
