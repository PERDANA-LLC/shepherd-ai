/**
 * Intertestament Reference API
 * 
 * GET /api/intertestament?passage=<ref>        → curated OT↔NT connections
 * GET /api/intertestament?passage=<ref>&ai=true → AI-generated + curated
 * GET /api/intertestament?search=<query>        → search by theme
 * GET /api/intertestament                       → list all connection themes
 */

import { NextRequest, NextResponse } from "next/server";
import {
  findIntertestamentConnections,
  searchConnections,
  getAllConnections,
  enrichConnections,
  buildIntertestamentPrompt
} from "@/lib/intertestament";
import { lookupPassage, versesToText } from "@/lib/bible";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const passage = searchParams.get("passage");
  const search = searchParams.get("search");
  const useAI = searchParams.get("ai") === "true";
  const focus = searchParams.get("focus") as "christological" | "trinitarian" | "theological" | null;

  try {
    // List all connection themes
    if (!passage && !search) {
      const all = getAllConnections();
      return NextResponse.json({
        total: all.length,
        themes: all.map(e => ({
          id: e.id,
          theme: e.theme,
          primaryReference: e.primaryReference,
          testament: e.testament,
          description: e.description,
          otCount: e.oldTestament.length,
          ntCount: e.newTestament.length
        }))
      });
    }

    // Search by theme
    if (search) {
      const results = searchConnections(search);
      return NextResponse.json({
        query: search,
        count: results.length,
        connections: results.map(e => ({
          id: e.id,
          theme: e.theme,
          primaryReference: e.primaryReference,
          description: e.description,
          otRefs: e.oldTestament.map(c => c.reference),
          ntRefs: e.newTestament.map(c => c.reference)
        }))
      });
    }

    // Look up connections for a specific passage
    if (passage) {
      // Get curated connections
      const curated = findIntertestamentConnections(passage);
      const enriched = curated.map(enrichConnections);

      // Build response
      const result: Record<string, unknown> = {
        passage,
        testament: /^(1|2)?\s*(Samuel|Kings|Chronicles|Isaiah|Jeremiah|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Esther|Job|Psalms?|Psalm|Proverbs|Ecclesiastes|Song of Solomon|Lamentations)/i.test(passage) ? "OT" : "NT",
        curatedCount: enriched.length,
        connections: enriched.map(e => ({
          id: e.id,
          theme: e.theme,
          description: e.description,
          howChristFulfills: null, // Only in AI-generated
          oldTestament: e.oldTestament.map(c => ({
            reference: c.reference,
            text: c.fullText,
            context: c.context,
            type: c.type
          })),
          newTestament: e.newTestament.map(c => ({
            reference: c.reference,
            text: c.fullText,
            context: c.context,
            type: c.type
          }))
        }))
      };

      // AI generation if requested
      if (useAI) {
        try {
          const verseResult = lookupPassage(passage);
          const passageText = verseResult && !verseResult.error
            ? versesToText(verseResult.verses)
            : passage;

          const prompt = buildIntertestamentPrompt(passage, passageText, focus || "christological");

          const apiKey = process.env.OPENROUTER_API_KEY || process.env.DEEPSEEK_API_KEY;
          if (apiKey) {
            const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://bs.thomasperdana.com",
                "X-Title": "Shepherd AI - Intertestament"
              },
              body: JSON.stringify({
                model: "deepseek/deepseek-chat",
                messages: [
                  { role: "system", content: "You are an intertestamental Bible scholar. Respond only with valid JSON." },
                  { role: "user", content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 3000
              })
            });

            if (aiResponse.ok) {
              const data = await aiResponse.json();
              let aiData: Record<string, unknown>;
              try {
                const rawContent = data.choices[0].message.content;
                const cleaned = rawContent
                  .replace(/^```json\s*/i, "")
                  .replace(/^```\s*/i, "")
                  .replace(/\s*```$/i, "")
                  .trim();
                aiData = JSON.parse(cleaned);
              } catch {
                const rawContent = data.choices[0].message.content;
                const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
                aiData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
              }

              result.aiGenerated = {
                theme: aiData.theme,
                description: aiData.description,
                howChristFulfills: aiData.howChristFulfills,
                oldTestament: (aiData.oldTestament as Array<Record<string, string>> || []).map((c: Record<string, string>) => ({
                  reference: c.reference,
                  context: c.context,
                  type: c.type
                })),
                newTestament: (aiData.newTestament as Array<Record<string, string>> || []).map((c: Record<string, string>) => ({
                  reference: c.reference,
                  context: c.context,
                  type: c.type
                }))
              };
            }
          }
        } catch (aiError) {
          console.error("AI intertestament generation failed:", aiError);
          // Continue with curated results even if AI fails
        }
      }

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Provide passage or search parameter" }, { status: 400 });

  } catch (error) {
    console.error("Intertestament API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
