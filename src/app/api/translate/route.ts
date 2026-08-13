import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { isApiSessionError, requireApiSession } from "@/lib/api-session";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/factory";
import { translateWithDictionary } from "@/lib/i18n/demo-dictionary";

const BodySchema = z.object({
  texts: z.array(z.string()).min(1).max(200),
  targetLanguage: z.string().default("Spanish"),
});

const TranslationSchema = z.object({
  translations: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  const session = await requireApiSession();
  if (isApiSessionError(session)) return session;

  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { texts, targetLanguage } = parsed.data;

  const settings = await db.userSettings.findUnique({ where: { userId: session.userId } });
  const provider = getAIProvider({ provider: settings?.aiProvider ?? "ANTHROPIC", model: settings?.aiModel });

  if (provider.isDemo) {
    return NextResponse.json({
      translations: translateWithDictionary(texts),
      usedDemoProvider: true,
    });
  }

  try {
    const prompt = `Translate each string in this JSON array to ${targetLanguage}. Preserve numbers, currency
symbols, product names/brand names, and punctuation style. Return a JSON object { "translations": string[] } with
EXACTLY ${texts.length} entries, in the same order, one per input string. Do not merge, skip, or add entries.

Input:
${JSON.stringify(texts)}`;

    const result = await provider.generateStructuredOutput(prompt, TranslationSchema, { feature: "translatePage" });

    const translations = texts.map((original, i) => result.data.translations[i] ?? original);

    return NextResponse.json({ translations, usedDemoProvider: false });
  } catch {
    // Never break the page over a translation failure — fall back to the
    // dictionary so common labels still translate.
    return NextResponse.json({ translations: translateWithDictionary(texts), usedDemoProvider: true });
  }
}
