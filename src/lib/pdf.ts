import { jsPDF } from "jspdf";

interface StudyData {
  passage_reference: string;
  passage_text: string;
  historical_context?: string;
  verse_breakdown?: {
    verse: string;
    text: string;
    explanation: string;
    cross_references: string[];
    word_study?: string;
  }[];
  key_themes?: string[];
  application_questions?: string[];
  prayer_prompt?: string;
}

interface StudyResponse {
  success: boolean;
  reference: string;
  translation: string;
  study: StudyData;
}

/** Generate a formatted PDF of a Bible study and trigger download */
export function downloadStudyPDF(study: StudyResponse): void {
  const s = study.study;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const MARGIN = 20;
  const WIDTH = doc.internal.pageSize.getWidth() - MARGIN * 2;
  let y = 25;

  // Helper: add text with auto-wrapping
  function addText(
    text: string,
    opts: { size?: number; bold?: boolean; color?: string; align?: "left" | "center" } = {}
  ): number {
    const { size = 10, bold = false, color = "#1a1a1a" } = opts;
    doc.setFontSize(size);
    doc.setFont("Helvetica", bold ? "bold" : "normal");
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, WIDTH);
    const lineHeight = size * 0.42;
    for (const line of lines) {
      if (y > 270) {
        doc.addPage();
        y = MARGIN;
      }
      doc.text(line, MARGIN, y, { align: opts.align || "left" });
      y += lineHeight;
    }
    y += 2;
    return y;
  }

  function addHR(): void {
    if (y > 270) {
      doc.addPage();
      y = MARGIN;
    }
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN, y, MARGIN + WIDTH, y);
    y += 5;
  }

  function addSection(icon: string, title: string): void {
    if (y > 260) {
      doc.addPage();
      y = MARGIN;
    }
    addHR();
    doc.setFontSize(13);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor("#1a1a1a");
    doc.text(`${icon}  ${title}`, MARGIN, y);
    y += 8;
  }

  // ─── Header ───
  doc.setFontSize(20);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor("#0d47a1");
  doc.text("Shepherd AI", MARGIN, y);
  y += 10;

  doc.setFontSize(11);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor("#555555");
  doc.text("KJV Bible Study", MARGIN, y);
  y += 10;

  // ─── Passage Reference ───
  addHR();
  addText(s.passage_reference, { size: 16, bold: true, color: "#0d47a1" });
  y += 2;

  // ─── KJV Passage Text ───
  doc.setFont("Courier", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#333333");
  const verseLines = doc.splitTextToSize(s.passage_text, WIDTH - 10);
  for (const line of verseLines) {
    if (y > 270) {
      doc.addPage();
      y = MARGIN;
    }
    doc.text(line, MARGIN + 5, y);
    y += 5;
  }
  y += 4;

  // ─── Historical Context ───
  if (s.historical_context) {
    addSection("\u{1F3DB}", "Historical Context");
    addText(s.historical_context);
  }

  // ─── Verse-by-Verse Study ───
  if (s.verse_breakdown && s.verse_breakdown.length > 0) {
    addSection("\u{1F4D6}", "Verse-by-Verse Study");

    for (const v of s.verse_breakdown) {
      if (y > 240) {
        doc.addPage();
        y = MARGIN;
      }

      // Verse reference
      doc.setFontSize(11);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor("#0d47a1");
      doc.text(v.verse, MARGIN, y);
      y += 6;

      // KJV text
      if (v.text) {
        doc.setFont("Courier", "italic");
        doc.setFontSize(9);
        doc.setTextColor("#555555");
        const tLines = doc.splitTextToSize(v.text, WIDTH - 10);
        for (const line of tLines) {
          if (y > 270) {
            doc.addPage();
            y = MARGIN;
          }
          doc.text(line, MARGIN + 5, y);
          y += 4.5;
        }
        y += 1;
      }

      // Explanation
      if (v.explanation) {
        addText(v.explanation, { size: 9, color: "#333333" });
      }

      // Word study
      if (v.word_study) {
        doc.setFontSize(9);
        doc.setFont("Helvetica", "italic");
        doc.setTextColor("#6a1b9a");
        const wsLines = doc.splitTextToSize(`\u{1F50D} ${v.word_study}`, WIDTH - 10);
        for (const line of wsLines) {
          if (y > 270) {
            doc.addPage();
            y = MARGIN;
          }
          doc.text(line, MARGIN + 5, y);
          y += 4.5;
        }
        y += 1;
      }

      y += 3;
    }
  }

  // ─── Key Themes ───
  if (s.key_themes && s.key_themes.length > 0) {
    addSection("\u{1F511}", "Key Themes");
    for (const theme of s.key_themes) {
      addText(`\u2022  ${theme}`, { size: 10 });
    }
  }

  // ─── Application Questions ───
  if (s.application_questions && s.application_questions.length > 0) {
    addSection("\u{1F4AD}", "Application Questions");
    s.application_questions.forEach((q, i) => {
      addText(`${i + 1}.  ${q}`, { size: 10 });
    });
  }

  // ─── Prayer Prompt ───
  if (s.prayer_prompt) {
    addSection("\u{1F64F}", "Prayer Prompt");
    addText(s.prayer_prompt, { size: 10, color: "#555555" });
    y += 3;
  }

  // ─── Footer ───
  addHR();
  doc.setFontSize(8);
  doc.setFont("Helvetica", "italic");
  doc.setTextColor("#999999");
  const footerText = `Generated by Shepherd AI  \u2022  shepherd-ai-chi.vercel.app  \u2022  ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;
  doc.text(footerText, MARGIN, y, { align: "left" });

  // Download
  const filename = `Shepherd_AI_${s.passage_reference.replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
}
