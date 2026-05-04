/**
 * Thompson Chain Reference API
 * 
 * GET /api/chain?topic=<keyword>     → search chains by name/description
 * GET /api/chain?id=<chainId>        → get full chain with verse texts
 * GET /api/chain?verse=<ref>         → find which chains contain a verse
 * GET /api/chain?category=<cat>      → list chains by category
 * POST /api/chain                    → AI-generate custom chain for a passage
 */

import { NextRequest, NextResponse } from "next/server";
import {
  chainTopics,
  chainTopicMap,
  searchAllChains,
  buildChainContextWithTexts,
  getChainsForVerse,
  lookupVerse,
  buildChainPrompt,
  getTopicsByCategory
} from "@/lib/chain-reference";

// ─── GET: Query Chains ─────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic");
  const id = searchParams.get("id");
  const verse = searchParams.get("verse");
  const category = searchParams.get("category");

  try {
    // Get specific chain by ID with verse texts
    if (id) {
      const chainId = parseInt(id, 10);
      if (isNaN(chainId)) {
        return NextResponse.json({ error: "Invalid chain ID" }, { status: 400 });
      }

      const ctx = buildChainContextWithTexts(chainId, verse ?? undefined);
      if (!ctx) {
        return NextResponse.json({ error: "Chain not found" }, { status: 404 });
      }

      return NextResponse.json({
        chain: {
          id: ctx.topic.id,
          name: ctx.topic.name,
          description: ctx.topic.description,
          category: ctx.topic.category,
          verseCount: ctx.verses.length
        },
        verses: ctx.verses,
        ...(verse ? {
          currentIndex: ctx.currentIndex,
          hasPrev: ctx.hasPrev,
          hasNext: ctx.hasNext,
          prevVerse: ctx.prevVerse,
          nextVerse: ctx.nextVerse
        } : {})
      });
    }

    // Find chains containing a specific verse
    if (verse) {
      const chains = getChainsForVerse(verse);
      return NextResponse.json({
        verse,
        chainCount: chains.length,
        chains: chains.map(c => ({
          id: c.topic.id,
          name: c.topic.name,
          description: c.topic.description,
          category: c.topic.category,
          position: c.currentIndex + 1,
          totalVerses: c.verses.length,
          nearbyVerses: c.verses
            .slice(Math.max(0, c.currentIndex - 2), c.currentIndex + 3)
            .map(v => ({ reference: v.reference, position: v.position + 1 }))
        }))
      });
    }

    // Filter by category
    if (category) {
      const topics = getTopicsByCategory(category);
      return NextResponse.json({
        category,
        count: topics.length,
        chains: topics.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          verseCount: t.verses.length
        }))
      });
    }

    // Search by keyword
    if (topic) {
      const results = searchAllChains(topic);
      return NextResponse.json({
        query: topic,
        count: results.length,
        chains: results.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          category: t.category,
          verseCount: t.verses.length,
          firstVerses: t.verses.slice(0, 3)
        }))
      });
    }

    // List all chains (summary)
    return NextResponse.json({
      totalChains: chainTopics.length,
      chains: chainTopics.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        verseCount: t.verses.length
      }))
    });

  } catch (error) {
    console.error("Chain API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── POST: AI-Generate Custom Chain ────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { passage, focus = "christological" } = body;

    if (!passage) {
      return NextResponse.json(
        { error: "Passage is required" },
        { status: 400 }
      );
    }

    // Look up the passage text
    const verseData = lookupVerse(passage);
    const passageText = verseData?.text ?? passage;

    // Check if we already have curated chains for this verse
    const existingChains = getChainsForVerse(passage);

    // Build the prompt
    const prompt = buildChainPrompt(passage, passageText, focus);

    // Call DeepSeek via OpenRouter
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://bs.thomasperdana.com",
        "X-Title": "Shepherd AI - Chain Reference"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          { role: "system", content: "You are a Thompson Chain Reference Bible curator. Respond only with valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      console.error("DeepSeek chain generation failed:", response.status);
      return NextResponse.json({
        generated: false,
        curatedChains: existingChains.map(c => ({
          id: c.topic.id,
          name: c.topic.name,
          description: c.topic.description,
          category: c.topic.category
        })),
        message: "AI generation unavailable — showing curated chains instead."
      });
    }

    const data = await response.json();
    let chainData;

    try {
      // DeepSeek sometimes wraps JSON in markdown fences
      const rawContent = data.choices[0].message.content;
      const cleaned = rawContent
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      chainData = JSON.parse(cleaned);
    } catch {
      // Fallback: try to extract JSON object
      const rawContent = data.choices[0].message.content;
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        chainData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    return NextResponse.json({
      generated: true,
      chain: {
        name: chainData.chainName,
        description: chainData.chainDescription,
        category: chainData.category,
        verses: chainData.verses
      },
      curatedChains: existingChains.map(c => ({
        id: c.topic.id,
        name: c.topic.name,
        description: c.topic.description,
        category: c.topic.category
      }))
    });

  } catch (error) {
    console.error("Chain generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate chain", generated: false },
      { status: 500 }
    );
  }
}
