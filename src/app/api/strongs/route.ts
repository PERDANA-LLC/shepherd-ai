import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

interface StrongsEntry {
  lemma: string;
  strongs_def: string;
  kjv_def: string;
  derivation: string;
  xlit?: string;
  pron?: string;
}

// Lazy-load and cache the dictionary
let dictionary: { greek: Record<string, StrongsEntry>; hebrew: Record<string, StrongsEntry> } | null = null;

function loadDictionary() {
  if (!dictionary) {
    const path = join(process.cwd(), "data", "strongs.json");
    dictionary = JSON.parse(readFileSync(path, "utf-8"));
  }
  return dictionary!;
}

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");

  if (!ref || !/^[GH]\d+$/i.test(ref)) {
    return NextResponse.json(
      { error: "Provide a Strong's reference like ?ref=G3439 or ?ref=H430" },
      { status: 400 }
    );
  }

  try {
    const dict = loadDictionary();
    const normalizedRef = ref.toUpperCase();
    const lang = normalizedRef.startsWith("G") ? "greek" : "hebrew";
    const entry = dict[lang][normalizedRef];

    if (!entry) {
      return NextResponse.json(
        { error: `Strong's ${normalizedRef} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ref: normalizedRef,
      language: lang === "greek" ? "Greek" : "Hebrew",
      ...entry,
    });
  } catch (error) {
    console.error("Strong's lookup error:", error);
    return NextResponse.json(
      { error: "Failed to look up Strong's reference" },
      { status: 500 }
    );
  }
}
