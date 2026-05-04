/**
 * Intertestament Reference Library
 * 
 * Functions for:
 * - Looking up curated OT↔NT connections for a passage
 * - Enriching connections with verse text
 * - AI-generating intertestament references for any passage
 */

import {
  findIntertestamentConnections,
  searchConnections,
  getAllConnections,
  type IntertestamentEntry,
  type TestamentConnection
} from "@/data/intertestament-connections";
import { lookupPassage, versesToText } from "./bible";

// ─── Text Enrichment ───────────────────────────────────────────

export interface EnrichedConnection extends TestamentConnection {
  fullText: string | null;  // The full KJV verse text
}

export interface EnrichedEntry {
  id: string;
  primaryReference: string;
  testament: "OT" | "NT";
  theme: string;
  description: string;
  oldTestament: EnrichedConnection[];
  newTestament: EnrichedConnection[];
}

/**
 * Enrich connections with full verse texts
 */
export function enrichConnections(entry: IntertestamentEntry): EnrichedEntry {
  const enrich = (conn: TestamentConnection): EnrichedConnection => {
    const result = lookupPassage(conn.reference);
    return {
      ...conn,
      fullText: result && !result.error ? versesToText(result.verses) : null
    };
  };

  return {
    ...entry,
    oldTestament: entry.oldTestament.map(enrich),
    newTestament: entry.newTestament.map(enrich)
  };
}

// ─── AI Prompt Generation ──────────────────────────────────────

/**
 * Build a DeepSeek prompt for intertestament reference generation.
 * Takes a passage and asks the AI to find OT↔NT connections.
 */
export function buildIntertestamentPrompt(
  passage: string,
  passageText: string,
  focus: "christological" | "trinitarian" | "theological"
): string {
  const testament = /^(1|2)?\s*(Samuel|Kings|Chronicles|Isaiah|Jeremiah|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Esther|Job|Psalms?|Psalm|Proverbs|Ecclesiastes|Song of Solomon|Lamentations)/i.test(passage)
    ? "OT" : "NT";

  const focusInstructions: Record<string, string> = {
    christological: "Emphasize how these connections point to Christ — OT foreshadowing Him, NT revealing Him.",
    trinitarian: "Emphasize how Father, Son, and Spirit each appear across these testaments — the Trinity in both covenants.",
    theological: "Trace the systematic theological development — how doctrine unfolds from OT seed to NT flower."
  };

  const direction = testament === "OT"
    ? `This is an OLD TESTAMENT passage. Find New Testament passages that:
   • DIRECTLY QUOTE this verse
   • FULFILL a prophecy found here
   • Show how Christ or the apostles INTERPRETED this theme
   • Apply the TYPOLOGY (if any) to Christ or the Church`
    : `This is a NEW TESTAMENT passage. Find Old Testament passages that:
   • Are DIRECTLY QUOTED here
   • Provide the FOUNDATION for what the NT author is teaching
   • Are ALLUDED to or echoed
   • Show how this NT truth is ROOTED in OT revelation`;

  return `You are an intertestamental Bible scholar. Analyze this passage and identify how the Old and New Testaments speak to each other about it.

## PASSAGE
Reference: ${passage}
Text (KJV): "${passageText}"
Testament: ${testament}

## DIRECTION
${direction}

## FOCUS
${focusInstructions[focus]}

## OUTPUT FORMAT
Return a JSON object with this exact structure — NO markdown fences, NO commentary:

{
  "theme": "Short theme name (5-8 words) connecting both testaments",
  "description": "One paragraph describing how this passage bridges the testaments",
  "howChristFulfills": "One paragraph on what Christ does with this passage (cite Gospel verses)",
  "oldTestament": [
    {
      "reference": "Book Chapter:Verse",
      "context": "One sentence explaining the OT context and its connection",
      "type": "direct_quote | fulfillment | typology | allusion | thematic"
    }
  ],
  "newTestament": [
    {
      "reference": "Book Chapter:Verse",
      "context": "One sentence explaining the NT context and its connection",
      "type": "direct_quote | fulfillment | typology | allusion | thematic"
    }
  ]
}

## RULES
- Include 3-6 OT references and 3-6 NT references
- Include at least ONE direct quote or fulfillment where applicable
- Include at least ONE Gospel reference
- Include at least ONE Epistle for application
- Every reference MUST exist in the KJV — verify or do not include
- Type must be one of: direct_quote, fulfillment, typology, allusion, thematic
- Return ONLY the JSON object, nothing else`;
}

// ─── Re-exports ────────────────────────────────────────────────

export {
  findIntertestamentConnections,
  searchConnections,
  getAllConnections
};

export type { IntertestamentEntry, TestamentConnection };
