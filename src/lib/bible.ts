/**
 * Local KJV Bible lookup — zero external dependencies.
 * Parses references like "John 3:16", "Romans 8:28-30", "Psalm 23"
 * against the downloaded kjv.json (31,102 verses, ~6.4 MB).
 */

import fs from "fs";
import path from "path";

interface Verse {
  book: string;
  book_id: string;
  chapter: number;
  verse: number;
  text: string;
}

let _bible: Verse[] | null = null;

function loadBible(): Verse[] {
  if (_bible) return _bible;
  const filePath = path.join(process.cwd(), "data", "kjv.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  _bible = JSON.parse(raw) as Verse[];
  return _bible;
}

/** Fuzzy book name → canonical book name mapping */
const BOOK_ALIASES: Record<string, string> = {
  // Full names
  genesis: "Genesis", exodus: "Exodus", leviticus: "Leviticus",
  numbers: "Numbers", deuteronomy: "Deuteronomy", joshua: "Joshua",
  judges: "Judges", ruth: "Ruth", job: "Job", psalms: "Psalms",
  psalm: "Psalms", proverbs: "Proverbs", ecclesiastes: "Ecclesiastes",
  isaiah: "Isaiah", jeremiah: "Jeremiah", lamentations: "Lamentations",
  ezekiel: "Ezekiel", daniel: "Daniel", hosea: "Hosea", joel: "Joel",
  amos: "Amos", obadiah: "Obadiah", jonah: "Jonah", micah: "Micah",
  nahum: "Nahum", habakkuk: "Habakkuk", zephaniah: "Zephaniah",
  haggai: "Haggai", zechariah: "Zechariah", malachi: "Malachi",
  matthew: "Matthew", mark: "Mark", luke: "Luke", john: "John",
  acts: "Acts", romans: "Romans", galatians: "Galatians",
  ephesians: "Ephesians", philippians: "Philippians",
  colossians: "Colossians", titus: "Titus", philemon: "Philemon",
  hebrews: "Hebrews", james: "James", jude: "Jude",
  revelation: "Revelation", esther: "Esther", ezra: "Ezra",
  nehemiah: "Nehemiah",

  // Numbered books (with spaces)
  "1 samuel": "1 Samuel", "2 samuel": "2 Samuel",
  "1 kings": "1 Kings", "2 kings": "2 Kings",
  "1 chronicles": "1 Chronicles", "2 chronicles": "2 Chronicles",
  "1 corinthians": "1 Corinthians", "2 corinthians": "2 Corinthians",
  "1 thessalonians": "1 Thessalonians", "2 thessalonians": "2 Thessalonians",
  "1 timothy": "1 Timothy", "2 timothy": "2 Timothy",
  "1 peter": "1 Peter", "2 peter": "2 Peter",
  "1 john": "1 John", "2 john": "2 John", "3 john": "3 John",

  // Abbreviated
  "1 sam": "1 Samuel", "2 sam": "2 Samuel",
  "1 kgs": "1 Kings", "2 kgs": "2 Kings",
  "1 chr": "1 Chronicles", "2 chr": "2 Chronicles",
  "1 cor": "1 Corinthians", "2 cor": "2 Corinthians",
  "1 thess": "1 Thessalonians", "2 thess": "2 Thessalonians",
  "1 tim": "1 Timothy", "2 tim": "2 Timothy",
  "1 pet": "1 Peter", "2 pet": "2 Peter",
  "1 jn": "1 John", "2 jn": "2 John", "3 jn": "3 John",
  "song of solomon": "Song of Solomon", "song of songs": "Song of Solomon",
  "sos": "Song of Solomon",
  "ss": "Song of Solomon",
  "rev": "Revelation",
  "eph": "Ephesians", "phil": "Philippians", "col": "Colossians",
  "gal": "Galatians", "rom": "Romans",
};

function resolveBook(input: string): string | null {
  const normalized = input.toLowerCase().trim();
  // Direct match
  if (BOOK_ALIASES[normalized]) return BOOK_ALIASES[normalized];
  // Check if it's already a canonical name
  const bible = loadBible();
  const found = bible.find(
    (v) => v.book.toLowerCase() === normalized
  );
  if (found) return found.book;
  return null;
}

interface VerseRange {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
}

/**
 * Parse a reference like "John 3:16", "Romans 8:28-30", "Psalm 23", "1 John 1:9"
 * Returns the matching verses.
 */
export function lookupPassage(reference: string): {
  reference: string;
  verses: Verse[];
  error?: string;
} {
  const bible = loadBible();
  const trimmed = reference.trim();

  // Try patterns: "Book Chapter:Verse-Verse" or "Book Chapter:Verse" or "Book Chapter"
  // Handle "1 John", "2 Kings", "Song of Solomon" etc.

  // Pattern 1: "Book Chapter:Verse" or "Book Chapter:Verse-Verse"
  const verseRangeRegex = /^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/i;
  const match1 = verseRangeRegex.exec(trimmed);

  if (match1) {
    const [, bookPart, chapterStr, verseStartStr, verseEndStr] = match1;
    const book = resolveBook(bookPart);
    if (!book) {
      // Try more aggressive book name matching
      // Walk backwards through the string to find the book name
      return { reference: trimmed, verses: [], error: `Unknown book: "${bookPart}". Try the full name (e.g., "1 Corinthians" instead of "1 Cor").` };
    }
    const chapter = parseInt(chapterStr, 10);
    const verseStart = parseInt(verseStartStr, 10);
    const verseEnd = verseEndStr ? parseInt(verseEndStr, 10) : verseStart;

    const matching = bible.filter(
      (v) =>
        v.book === book &&
        v.chapter === chapter &&
        v.verse >= verseStart &&
        v.verse <= verseEnd
    );

    if (matching.length === 0) {
      return { reference: trimmed, verses: [], error: `No verses found for ${book} ${chapter}:${verseStart}${verseEndStr ? `-${verseEndStr}` : ""}.` };
    }

    return { reference: `${book} ${chapter}:${verseStart}${verseEndStr ? `-${verseEnd}` : ""}`, verses: matching };
  }

  // Pattern 2: "Book Chapter" (whole chapter)
  const chapterRegex = /^(.+?)\s+(\d+)$/i;
  const match2 = chapterRegex.exec(trimmed);

  if (match2) {
    const [, bookPart, chapterStr] = match2;
    const book = resolveBook(bookPart);
    if (!book) {
      return { reference: trimmed, verses: [], error: `Unknown book: "${bookPart}".` };
    }
    const chapter = parseInt(chapterStr, 10);
    const matching = bible.filter(
      (v) => v.book === book && v.chapter === chapter
    );
    if (matching.length === 0) {
      return { reference: trimmed, verses: [], error: `No verses found for ${book} ${chapter}.` };
    }
    return { reference: `${book} ${chapter}`, verses: matching };
  }

  return { reference: trimmed, verses: [], error: `Could not parse reference: "${trimmed}". Try "John 3:16" or "Romans 8:28-30".` };
}

/** Get all verses as plain text */
export function versesToText(verses: Verse[]): string {
  return verses.map((v) => v.text).join("\n");
}
