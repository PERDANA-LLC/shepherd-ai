/**
 * Thompson Chain Reference — Core Library
 * 
 * Functions for:
 * - Looking up verse text via the existing KJV bible lookup
 * - Traversing chains (prev/next verse)
 * - Finding which chains contain a verse
 * - AI-generated custom chains via DeepSeek
 */

import { chainTopics, chainTopicMap, findChainsForVerse, searchChains } from "@/data/chain-topics";
import type { ChainTopic } from "@/data/chain-topics";
import { lookupPassage } from "./bible";

// ─── Verse Lookup (via existing bible.ts) ──────────────────────

/**
 * Look up a single verse's text using the existing bible.ts lookupPassage
 */
export function lookupVerse(ref: string): { reference: string; text: string } | null {
  const result = lookupPassage(ref);
  if (result.error || result.verses.length === 0) return null;
  return {
    reference: result.reference,
    text: result.verses[0].text
  };
}

/**
 * Parse a verse reference into components.
 * Uses bible.ts lookupPassage for validation.
 */
export function parseReference(ref: string): { book: string; chapter: number; verse: number } | null {
  const result = lookupPassage(ref);
  if (result.error || result.verses.length === 0) return null;
  const v = result.verses[0];
  return { book: v.book, chapter: v.chapter, verse: v.verse };
}

// ─── Chain Traversal ───────────────────────────────────────────

export interface ChainVerse {
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  text: string | null;
  position: number;   // 0-based index in the chain
  isCurrent: boolean;  // true if this is the verse being studied
}

export interface ChainContext {
  topic: ChainTopic;
  verses: ChainVerse[];
  currentIndex: number;
  hasPrev: boolean;
  hasNext: boolean;
  prevVerse: ChainVerse | null;
  nextVerse: ChainVerse | null;
}

/**
 * Build full chain context for a given topic and optional current verse
 */
export function buildChainContext(
  chainId: number,
  currentRef?: string
): ChainContext | null {
  const topic = chainTopicMap.get(chainId);
  if (!topic) return null;

  let currentIndex = -1;
  const normalizedCurrent = currentRef?.trim().replace(/\s+/g, ' ');

  const verses: ChainVerse[] = topic.verses.map((ref, idx) => {
    const parsed = parseReference(ref);
    const isCurrent = normalizedCurrent
      ? ref.trim().replace(/\s+/g, ' ') === normalizedCurrent
      : false;
    
    if (isCurrent) currentIndex = idx;

    return {
      reference: ref,
      book: parsed?.book ?? "",
      chapter: parsed?.chapter ?? 0,
      verse: parsed?.verse ?? 0,
      text: null, // lazy-loaded for display
      position: idx,
      isCurrent
    };
  });

  return {
    topic,
    verses,
    currentIndex: currentIndex >= 0 ? currentIndex : 0,
    hasPrev: currentIndex > 0,
    hasNext: currentIndex < verses.length - 1,
    prevVerse: currentIndex > 0 ? verses[currentIndex - 1] : null,
    nextVerse: currentIndex < verses.length - 1 ? verses[currentIndex + 1] : null
  };
}

/**
 * Get all chains that reference a given verse, with context
 */
export function getChainsForVerse(ref: string): ChainContext[] {
  const chains = findChainsForVerse(ref);
  return chains.map(topic => buildChainContext(topic.id, ref)!);
}

/**
 * Build chain context with verse texts populated
 */
export function buildChainContextWithTexts(
  chainId: number,
  currentRef?: string
): ChainContext | null {
  const ctx = buildChainContext(chainId, currentRef);
  if (!ctx) return null;

  ctx.verses = ctx.verses.map(v => {
    const result = lookupVerse(v.reference);
    return {
      ...v,
      text: result?.text ?? null
    };
  });

  return ctx;
}

// ─── AI Chain Generation ───────────────────────────────────────

/**
 * DeepSeek prompt for Thompson-style chain generation.
 * Takes a passage and returns a structured chain of cross-references.
 */
export function buildChainPrompt(
  passage: string,
  passageText: string,
  focus: "christological" | "trinitarian" | "theological"
): string {
  const focusInstructions: Record<string, string> = {
    christological: "Prioritize chains that trace Christological themes — how this passage connects to Jesus' person and work.",
    trinitarian: "Prioritize chains that trace Trinitarian themes — how Father, Son, and Spirit each relate to this passage's content.",
    theological: "Prioritize chains that trace systematic theological loci — Theology Proper, Anthropology, Christology, Soteriology, Pneumatology, Ecclesiology, Eschatology."
  };

  return `You are a Thompson Chain Reference Bible curator. Given a Bible passage, generate a structured chain of cross-references that trace a major theme or topic through Scripture.

## PASSAGE
Reference: ${passage}
Text (KJV): "${passageText}"

## INSTRUCTIONS
${focusInstructions[focus]}

Generate a JSON response with this exact structure:
{
  "chainName": "Topic name (short, like in Thompson's index)",
  "chainDescription": "One sentence describing what this chain traces",
  "category": "One of: God, Jesus Christ, Holy Spirit, Salvation, Scripture, Sin, Christian Life, Suffering, Church, End Times, Covenants, Discipleship, Wisdom, Family, Virtues",
  "verses": [
    {
      "reference": "Book Chapter:Verse",
      "relevance": "One sentence explaining why this verse is in the chain"
    }
  ]
}

## RULES
- Include 8-15 verses spanning both Old and New Testaments
- The FIRST verse in the chain should be from the Old Testament (foundation)
- The CENTRAL verse should be the given passage or directly related to it
- Include Gospel accounts where relevant
- Include Epistle applications
- End with a consummation/glory verse where appropriate
- Every verse must exist in the KJV — no guesses
- Return ONLY valid JSON, no markdown fences, no commentary

## EXAMPLE OUTPUT
{
  "chainName": "The Blood of Atonement",
  "chainDescription": "The covering, cleansing, and redeeming power of blood — from the Passover lamb to the Lamb of God.",
  "category": "Salvation",
  "verses": [
    { "reference": "Exodus 12:13", "relevance": "The institution — blood as covering from judgment" },
    { "reference": "Leviticus 17:11", "relevance": "The principle — life is in the blood, given for atonement" },
    { "reference": "Isaiah 53:5", "relevance": "The prophecy — wounded for our transgressions" },
    { "reference": "Matthew 26:28", "relevance": "The fulfillment — Christ's blood of the new covenant" },
    { "reference": "John 6:53", "relevance": "The participation — drinking His blood by faith" },
    { "reference": "Acts 20:28", "relevance": "The purchase — church bought with His own blood" },
    { "reference": "Romans 3:25", "relevance": "The propitiation — faith in His blood" },
    { "reference": "Romans 5:9", "relevance": "The justification — justified by His blood" },
    { "reference": "Ephesians 1:7", "relevance": "The redemption — redemption through His blood" },
    { "reference": "Colossians 1:20", "relevance": "The reconciliation — peace through the blood of His cross" },
    { "reference": "Hebrews 9:14", "relevance": "The cleansing — purge your conscience by His blood" },
    { "reference": "1 Peter 1:19", "relevance": "The value — precious blood of Christ" },
    { "reference": "1 John 1:7", "relevance": "The ongoing — blood cleanses from all sin" },
    { "reference": "Revelation 12:11", "relevance": "The victory — overcame by the blood of the Lamb" }
  ]
}`;
}

// ─── Chain Utilities ────────────────────────────────────────────

/**
 * Get chain topic by ID
 */
export function getChainTopic(id: number): ChainTopic | undefined {
  return chainTopicMap.get(id);
}

/**
 * Get all topics in a category
 */
export function getTopicsByCategory(category: string): ChainTopic[] {
  return chainTopics.filter(t => 
    t.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Search all chains
 */
export const searchAllChains = searchChains;

export { chainTopics, chainTopicMap } from "@/data/chain-topics";
