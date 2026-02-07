import { NextResponse } from "next/server";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://twsia.com";

/**
 * llms.txt - ملف موجّه لمحركات البحث المعتمدة على الذكاء الاصطناعي
 * يساعد البوتات والـ LLMs على فهم الموقع واستخدامه بشكل صحيح
 * @see https://llmstxt.org/
 */
export function GET() {
  const content = `
${baseUrl}/
${baseUrl}/companies
${baseUrl}/search
${baseUrl}/about
${baseUrl}/services
${baseUrl}/reviews
${baseUrl}/privacy
${baseUrl}/terms

## Sitemap
${baseUrl}/sitemap.xml

## Robots
${baseUrl}/robots.txt
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
