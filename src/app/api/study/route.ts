import { NextRequest, NextResponse } from "next/server";
import { lookupPassage, versesToText } from "@/lib/bible";

// Vercel Hobby plan allows up to 60s for serverless functions
export const maxDuration = 60;

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://openrouter.ai/api/v1";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek/deepseek-v4-pro";

const SYSTEM_PROMPT = `You are Shepherd AI, a theologically conservative KJV Bible study assistant.

Your responses must:
1. Use ONLY the King James Version for all scripture quotations.
2. Maintain doctrinal fidelity to historic Protestant orthodoxy.
3. When discussing word meanings, reference Strong's Concordance numbers.
4. Provide 3-5 cross-references for each key verse.
5. Include 2-3 application questions for personal reflection.
6. Note any significant Hebrew/Greek word insights.
7. Be scholarly yet accessible — written for everyday believers, not seminarians.
8. NEVER speculate beyond what scripture actually says.
9. If a passage has multiple orthodox interpretations, present them fairly
   without undermining the authority of scripture.
10. End each study with a brief prayer prompt related to the passage.

Format your response as JSON with these exact keys:
{
  "passage_reference": "string",
  "passage_text": "string (the full KJV text)",
  "historical_context": "string",
  "verse_breakdown": [
    {
      "verse": "string (e.g. 'John 3:16')",
      "text": "string (KJV text of this verse)",
      "explanation": "string",
      "cross_references": ["string (e.g. 'Romans 5:8')"],
      "word_study": "string (optional, mention Strong's numbers)"
    }
  ],
  "key_themes": ["string"],
  "application_questions": ["string"],
  "prayer_prompt": "string"
}`;

interface StudyRequest {
  passage: string;
}

export async function POST(request: NextRequest) {
  try {
    const { passage } = (await request.json()) as StudyRequest;

    if (!passage || typeof passage !== "string") {
      return NextResponse.json(
        { error: "Please provide a Bible passage reference (e.g., 'John 3:16')." },
        { status: 400 }
      );
    }

    // Step 1: Look up passage from local KJV database (31,102 verses)
    const result = lookupPassage(passage);

    if (result.error || result.verses.length === 0) {
      return NextResponse.json(
        { error: result.error || `Could not find passage: "${passage}".` },
        { status: 404 }
      );
    }

    const passageText = versesToText(result.verses);

    // Step 2: Send to DeepSeek for AI-powered study
    const userMessage = `Please provide a comprehensive KJV Bible study for the following passage:

**Reference:** ${result.reference}
**KJV Text:**
${passageText}

Generate the study following your system instructions. Return valid JSON only.`;

    const aiResponse = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        ...(DEEPSEEK_BASE_URL.includes("openrouter")
          ? { "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000" }
          : {}),
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        // NOTE: DeepSeek v4 Pro (reasoning model) does not support response_format json_object.
        // JSON enforcement is handled by the system prompt instead.
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("DeepSeek API error:", errorText);
      return NextResponse.json(
        { error: "The AI study engine encountered an error. Please try again." },
        { status: 502 }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error("DeepSeek returned empty content. Full response:", JSON.stringify(aiData).slice(0, 500));
      return NextResponse.json(
        { error: "The AI study engine returned an empty response. This can happen if the passage is too long or the API is rate-limited. Try a shorter passage." },
        { status: 502 }
      );
    }

    // Parse the JSON response from DeepSeek
    let studyData;
    try {
      studyData = JSON.parse(content);
    } catch {
      studyData = {
        passage_reference: result.reference,
        passage_text: passageText,
        raw_study: content,
      };
    }

    // Step 3: Return the complete study
    return NextResponse.json({
      success: true,
      reference: result.reference,
      translation: "King James Version (local)",
      study: studyData,
    });
  } catch (error) {
    console.error("Study API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
