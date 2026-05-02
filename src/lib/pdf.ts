import { jsPDF } from "jspdf";

// ── Study data interfaces ────────────────────────────────────────

interface L1MemoryVerse { verse: string; text: string; hand_motion: string; }
interface L1Study {
  passage_reference: string; passage_text: string; level: 1; level_name: string;
  big_idea: string; memory_verse: L1MemoryVerse; picture_this: string;
  think_about_it: string[]; try_this: string; talk_to_god: string; show_someone: string;
}
interface L2Verse { verse: string; text: string; context: string; }
interface L2Study {
  passage_reference: string; passage_text: string; level: 2; level_name: string;
  the_hook: string; the_text: L2Verse[]; what_it_really_means: string;
  the_clash: string; your_turn: string[]; this_week: string; prayer: string;
}
interface L3WordStudy { word: string; strongs: string; definition: string; semantic_range: string; other_uses: string[]; }
interface L3InterpretiveOption { view: string; description: string; strength: string; weakness: string; }
interface L3Pitfall { misunderstanding: string; consequence: string; corrective_verse: string; }
interface L3Study {
  passage_reference: string; passage_text: string; level: 3; level_name: string;
  thesis_statement: string;
  text_and_context: { historical_background: string; literary_context: string; authorial_intent: string };
  word_study: L3WordStudy; interpretive_options: L3InterpretiveOption[];
  reformed_view: string; theological_pitfalls: L3Pitfall;
  discussion_questions: string[]; research_assignment: string; teach_it: string;
}
interface L4Exegesis { verse: string; greek_or_hebrew: string; parsing: string; syntax: string; textual_variants?: string; lxx_background?: string; }
interface L4Philology { word: string; etymology: string; cognates: string; diachronic_development: string; synchronic_usage: string; dictionary_entries: string; }
interface L4Debate { position: string; scholar: string; argument: string; presuppositions: string; }
interface L4Bibliography { source: string; type: string; annotation: string; }
interface L4Systematic { locus: string; explanation: string; }
interface L4Sermon { titles: string[]; outline: string; tough_questions: string[]; }
interface L4Study {
  passage_reference: string; passage_text: string; level: 4; level_name: string;
  research_question: string; exegetical_analysis: L4Exegesis[];
  philological_deep_dive: L4Philology; scholarly_debate: L4Debate[];
  reformed_position: string; pastoral_note: string;
  annotated_bibliography: L4Bibliography[]; systematic_theology_connection: L4Systematic;
  sermon_prep: L4Sermon; original_contribution: string; research_plan: string;
}
interface LegacyVerse { verse: string; text: string; explanation: string; cross_references: string[]; word_study?: string; }
interface LegacyStudy {
  passage_reference: string; passage_text: string;
  historical_context?: string; verse_breakdown?: LegacyVerse[];
  key_themes?: string[]; application_questions?: string[]; prayer_prompt?: string;
}
type StudyData = L1Study | L2Study | L3Study | L4Study | LegacyStudy;

interface StudyResponse {
  success: boolean;
  reference: string;
  translation: string;
  level?: number;
  level_name?: string;
  study: StudyData;
}

// ── PDF helpers ───────────────────────────────────────────────────

const MARGIN = 20;
const LEVEL_COLORS: Record<number, string> = { 1: "#3fb950", 2: "#d2991d", 3: "#58a6ff", 4: "#a371f7" };
const LEVEL_LABELS: Record<number, string> = { 1: "5th Grade", 2: "High School", 3: "College", 4: "PhD" };

function sanitize(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/[\u2000-\u200F\u2028-\u202F]/g, " ")
    .replace(/[\u2600-\u27BF\uD83C\uD83D\uD83E][\uDC00-\uDFFF]?/g, "")
    .replace(/[\uFE00-\uFE0F]/g, "")
    .trim();
}

// ── L1: 5th Grade ─────────────────────────────────────────────────

function renderL1(doc: jsPDF, s: L1Study, getY: () => number, setY: (y: number) => void): void {
  const W = doc.internal.pageSize.getWidth() - MARGIN * 2;
  const add = textBlock(doc, getY, setY, W);
  const sect = sectionFn(doc, getY, setY, W);

  sect("📌", "The Big Idea");
  add(s.big_idea, { size: 12, bold: true, color: "#c9d1d9" });

  sect("📖", "Memory Verse");
  add(s.memory_verse.verse, { size: 11, bold: true, color: "#3fb950", font: "Courier" });
  add(s.memory_verse.text, { size: 10, italic: true });
  add("🖐️ Hand Motion: " + s.memory_verse.hand_motion, { size: 10, color: "#8b949e" });

  sect("🎨", "Picture This");
  add(s.picture_this, { size: 10 });

  sect("❓", "Think About It");
  s.think_about_it?.forEach((q, i) => {
    add(`${i + 1}.  ${q}`, { size: 10 });
  });

  sect("🎮", "Try This");
  add(s.try_this, { size: 10 });

  sect("🙏", "Talk to God");
  add(s.talk_to_god, { size: 10, italic: true });

  sect("⭐", "Show Someone");
  add(s.show_someone, { size: 10 });
}

// ── L2: High School ───────────────────────────────────────────────

function renderL2(doc: jsPDF, s: L2Study, getY: () => number, setY: (y: number) => void): void {
  const W = doc.internal.pageSize.getWidth() - MARGIN * 2;
  const add = textBlock(doc, getY, setY, W);
  const sect = sectionFn(doc, getY, setY, W);

  sect("🎬", "The Hook");
  add(s.the_hook, { size: 10 });

  sect("📖", "The Text");
  s.the_text?.forEach((v) => {
    add(v.verse, { size: 11, bold: true, color: "#d2991d", font: "Courier" });
    add(v.text, { size: 10, italic: true });
    add(v.context, { size: 10, color: "#8b949e" });
    add("", { size: 4 });
  });

  sect("🔍", "What It Really Means");
  add(s.what_it_really_means, { size: 10 });

  sect("⚡", "The Clash");
  add(s.the_clash, { size: 10 });

  sect("🧠", "Your Turn");
  s.your_turn?.forEach((q, i) => {
    add(`${i + 1}.  ${q}`, { size: 10 });
  });

  sect("🛠️", "This Week");
  add(s.this_week, { size: 10 });

  sect("🙏", "Prayer");
  add(s.prayer, { size: 10, italic: true });
}

// ── L3: College ───────────────────────────────────────────────────

function renderL3(doc: jsPDF, s: L3Study, getY: () => number, setY: (y: number) => void): void {
  const W = doc.internal.pageSize.getWidth() - MARGIN * 2;
  const add = textBlock(doc, getY, setY, W);
  const sect = sectionFn(doc, getY, setY, W);

  sect("📌", "Thesis Statement");
  add(s.thesis_statement, { size: 11, bold: true, color: "#c9d1d9" });

  sect("📖", "Text & Context");
  if (s.text_and_context) {
    add("Historical Background:", { size: 9, bold: true, color: "#58a6ff" });
    add(s.text_and_context.historical_background, { size: 9 });
    add("Literary Context:", { size: 9, bold: true, color: "#58a6ff" });
    add(s.text_and_context.literary_context, { size: 9 });
    add("Authorial Intent:", { size: 9, bold: true, color: "#58a6ff" });
    add(s.text_and_context.authorial_intent, { size: 9 });
  }

  sect("🔤", "Word Study");
  if (s.word_study) {
    add(`${s.word_study.word} (${s.word_study.strongs})`, { size: 11, bold: true, font: "Courier", color: "#58a6ff" });
    add(`Definition: ${s.word_study.definition}`, { size: 9 });
    add(`Semantic Range: ${s.word_study.semantic_range}`, { size: 9 });
    if (s.word_study.other_uses?.length) {
      add("Other Uses:", { size: 9, bold: true });
      s.word_study.other_uses.forEach((u, i) => add(`  ${i + 1}. ${u}`, { size: 9 }));
    }
  }

  sect("📊", "Interpretive Options");
  s.interpretive_options?.forEach((opt) => {
    add(opt.view, { size: 10, bold: true, color: "#58a6ff" });
    add(opt.description, { size: 9 });
    add(`✓ ${opt.strength}  |  ⚠ ${opt.weakness}`, { size: 8, color: "#8b949e" });
    add("", { size: 3 });
  });
  if (s.reformed_view) {
    add("Reformed View:", { size: 9, bold: true, color: "#58a6ff" });
    add(s.reformed_view, { size: 9 });
  }

  sect("⚠️", "Theological Pitfalls");
  if (s.theological_pitfalls) {
    add(`Misunderstanding: ${s.theological_pitfalls.misunderstanding}`, { size: 9 });
    add(`Consequence: ${s.theological_pitfalls.consequence}`, { size: 9 });
    add(s.theological_pitfalls.corrective_verse, { size: 9, font: "Courier", color: "#58a6ff" });
  }

  sect("❓", "Discussion Questions");
  s.discussion_questions?.forEach((q, i) => add(`${i + 1}.  ${q}`, { size: 10 }));

  sect("🎓", "Research Assignment");
  add(s.research_assignment, { size: 10 });

  sect("🎯", "Teach It");
  add(s.teach_it, { size: 10 });
}

// ── L4: PhD ──────────────────────────────────────────────────────

function renderL4(doc: jsPDF, s: L4Study, getY: () => number, setY: (y: number) => void): void {
  const W = doc.internal.pageSize.getWidth() - MARGIN * 2;
  const add = textBlock(doc, getY, setY, W);
  const sect = sectionFn(doc, getY, setY, W);

  sect("🔬", "Research Question");
  add(s.research_question, { size: 11, bold: true, color: "#c9d1d9" });

  sect("📖", "Exegetical Analysis");
  s.exegetical_analysis?.forEach((v) => {
    add(v.verse, { size: 11, bold: true, font: "Courier", color: "#a371f7" });
    add(`Greek/Hebrew: ${v.greek_or_hebrew}`, { size: 9 });
    add(`Parsing: ${v.parsing}`, { size: 9 });
    add(`Syntax: ${v.syntax}`, { size: 9 });
    if (v.textual_variants) add(`Textual Variants: ${v.textual_variants}`, { size: 9 });
    if (v.lxx_background) add(`LXX Background: ${v.lxx_background}`, { size: 9 });
    add("", { size: 3 });
  });

  sect("🔤", "Philological Deep Dive");
  if (s.philological_deep_dive) {
    const p = s.philological_deep_dive;
    add(p.word, { size: 11, bold: true, font: "Courier", color: "#a371f7" });
    add(`Etymology: ${p.etymology}`, { size: 9 });
    add(`Cognates: ${p.cognates}`, { size: 9 });
    add(`Diachronic: ${p.diachronic_development}`, { size: 9 });
    add(`Synchronic: ${p.synchronic_usage}`, { size: 9 });
    add(`Dictionaries: ${p.dictionary_entries}`, { size: 9 });
  }

  sect("⚔️", "Scholarly Debate");
  s.scholarly_debate?.forEach((d) => {
    add(`${d.position} — ${d.scholar}`, { size: 10, bold: true, color: "#a371f7" });
    add(d.argument, { size: 9 });
    add(`Presuppositions: ${d.presuppositions}`, { size: 9, color: "#8b949e" });
    add("", { size: 3 });
  });

  sect("🏛️", "Reformed Position");
  add(s.reformed_position, { size: 10 });

  sect("💬", "Pastoral Note");
  add(s.pastoral_note, { size: 10 });

  sect("📚", "Annotated Bibliography");
  s.annotated_bibliography?.forEach((b) => {
    add(`${b.source} (${b.type})`, { size: 10, bold: true, color: "#a371f7" });
    add(b.annotation, { size: 9 });
    add("", { size: 2 });
  });

  sect("📐", "Systematic Theology");
  if (s.systematic_theology_connection) {
    add(s.systematic_theology_connection.locus, { size: 10, bold: true, color: "#a371f7" });
    add(s.systematic_theology_connection.explanation, { size: 9 });
  }

  sect("🎤", "Sermon Prep");
  if (s.sermon_prep) {
    add("Titles:", { size: 9, bold: true });
    s.sermon_prep.titles?.forEach((t, i) => add(`  ${i + 1}. ${t}`, { size: 9 }));
    add("Outline:", { size: 9, bold: true });
    add(s.sermon_prep.outline, { size: 9 });
    add("Tough Questions:", { size: 9, bold: true });
    s.sermon_prep.tough_questions?.forEach((q, i) => add(`  ${i + 1}. ${q}`, { size: 9 }));
  }

  sect("🧪", "Original Contribution");
  add(s.original_contribution, { size: 10 });

  sect("🗓️", "30-Day Research Plan");
  add(s.research_plan, { size: 10 });
}

// ── Legacy format ─────────────────────────────────────────────────

function renderLegacy(doc: jsPDF, s: LegacyStudy, getY: () => number, setY: (y: number) => void): void {
  const W = doc.internal.pageSize.getWidth() - MARGIN * 2;
  const add = textBlock(doc, getY, setY, W);
  const sect = sectionFn(doc, getY, setY, W);

  if (s.historical_context) {
    sect("🏛️", "Historical Context");
    add(s.historical_context);
  }

  if (s.verse_breakdown?.length) {
    sect("📖", "Verse-by-Verse Study");
    for (const v of s.verse_breakdown) {
      add(v.verse, { size: 11, bold: true, color: "#0d47a1", font: "Courier" });
      if (v.text) add(v.text, { size: 9, italic: true, color: "#555555", font: "Courier" });
      if (v.explanation) add(v.explanation, { size: 9 });
      if (v.word_study) add(`🔍 ${v.word_study}`, { size: 9, color: "#6a1b9a", italic: true });
      if (v.cross_references?.length) add(`Cross-refs: ${v.cross_references.join(", ")}`, { size: 8, color: "#d2991d" });
      add("", { size: 3 });
    }
  }

  if (s.key_themes?.length) {
    sect("🔑", "Key Themes");
    s.key_themes.forEach((t) => add(`▸ ${t}`, { size: 10 }));
  }

  if (s.application_questions?.length) {
    sect("💭", "Application Questions");
    s.application_questions.forEach((q, i) => add(`${i + 1}.  ${q}`, { size: 10 }));
  }

  if (s.prayer_prompt) {
    sect("🙏", "Prayer Prompt");
    add(s.prayer_prompt, { size: 10, italic: true, color: "#555555" });
  }
}

// ── Shared helpers ────────────────────────────────────────────────

// Y-position captured in closure — avoids passing y around
function makePdf(doc: jsPDF): {
  y: () => number;
  incY: (dy: number) => void;
  setY: (v: number) => void;
  checkPageBreak: (needed?: number) => void;
  addHR: () => void;
} {
  let _y = 25;

  const check = (needed = 0) => {
    if (_y + needed > 270) {
      doc.addPage();
      _y = MARGIN;
    }
  };

  const addHR = () => {
    check(5);
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN, _y, doc.internal.pageSize.getWidth() - MARGIN, _y);
    _y += 5;
  };

  return {
    y: () => _y,
    incY: (dy) => { check(dy); _y += dy; },
    setY: (v) => { _y = v; },
    checkPageBreak: check,
    addHR,
  };
}

// Create text/label helper factories closed over doc + y state
function textBlock(doc: jsPDF, getY: () => number, setY: (v: number) => void, maxWidth: number) {
  return (text: string, opts: { size?: number; bold?: boolean; italic?: boolean; color?: string; font?: string } = {}) => {
    let y = getY();
    const { size = 10, bold = false, italic = false, color = "#333333", font = "Helvetica" } = opts;

    // Determine font style
    let style = "normal";
    if (bold && italic) style = "bolditalic";
    else if (bold) style = "bold";
    else if (italic) style = "italic";

    doc.setFontSize(size);
    doc.setFont(font, style);
    doc.setTextColor(color);

    if (!text) {
      y += size * 0.42;
      setY(y);
      return;
    }

    const lines = doc.splitTextToSize(sanitize(text), maxWidth);
    for (const line of lines) {
      if (y > 270) {
        doc.addPage();
        y = MARGIN;
      }
      doc.text(line, MARGIN, y);
      y += size * 0.42;
    }
    y += 2;
    setY(y);
  };
}

function sectionFn(doc: jsPDF, getY: () => number, setY: (v: number) => void, maxWidth: number) {
  return (icon: string, title: string) => {
    let y = getY();
    if (y > 255) {
      doc.addPage();
      y = MARGIN;
      setY(y);
    }
    // HR line
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN, y, doc.internal.pageSize.getWidth() - MARGIN, y);
    y += 6;
    // Section title
    doc.setFontSize(12);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor("#1a1a1a");
    const label = sanitize(`${icon}  ${title}`);
    doc.text(label, MARGIN, y);
    y += 8;
    setY(y);
  };
}

// ── Main export ───────────────────────────────────────────────────

/** Generate a formatted PDF of a Bible study and trigger download */
export function downloadStudyPDF(studyResponse: StudyResponse): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const s = studyResponse.study;
  const level = studyResponse.level ?? (s as any).level ?? 0;
  const levelColor = LEVEL_COLORS[level] || "#0d47a1";

  const { y, incY, setY, addHR } = makePdf(doc);

  // ─── Header ───
  doc.setFontSize(20);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(levelColor);
  doc.text("Shepherd AI", MARGIN, y());
  incY(10);

  doc.setFontSize(11);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor("#555555");
  doc.text("KJV Bible Study", MARGIN, y());
  incY(10);

  // Level badge
  if (level && LEVEL_LABELS[level]) {
    doc.setFontSize(9);
    doc.setFont("Helvetica", "italic");
    doc.setTextColor(levelColor);
    doc.text(`Level ${level}: ${LEVEL_LABELS[level]}`, MARGIN, y());
    incY(8);
  }

  // ─── Passage Reference ───
  addHR();
  const title = textBlock(doc, y, setY, doc.internal.pageSize.getWidth() - MARGIN * 2);
  title(s.passage_reference, { size: 16, bold: true, color: levelColor });
  incY(2);

  // ─── KJV Passage Text ───
  doc.setFont("Courier", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#333333");
  const verseLines = doc.splitTextToSize(sanitize(s.passage_text), doc.internal.pageSize.getWidth() - MARGIN * 2 - 10);
  let curY = y();
  for (const line of verseLines) {
    if (curY > 270) {
      doc.addPage();
      curY = MARGIN;
    }
    doc.text(line, MARGIN + 5, curY);
    curY += 5;
  }
  setY(curY + 4);

  // ─── Level-specific content ───
  switch (level) {
    case 1: renderL1(doc, s as L1Study, y, setY); break;
    case 2: renderL2(doc, s as L2Study, y, setY); break;
    case 3: renderL3(doc, s as L3Study, y, setY); break;
    case 4: renderL4(doc, s as L4Study, y, setY); break;
    default: renderLegacy(doc, s as LegacyStudy, y, setY); break;
  }

  // ─── Footer ───
  setY(Math.max(y(), 255));
  addHR();
  doc.setFontSize(8);
  doc.setFont("Helvetica", "italic");
  doc.setTextColor("#999999");
  const footer = `Generated by Shepherd AI  •  bs.thomasperdana.com  •  ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;
  doc.text(sanitize(footer), MARGIN, y(), { align: "left" });

  // ─── Download ───
  const filename = `Shepherd_AI_${s.passage_reference.replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
}
