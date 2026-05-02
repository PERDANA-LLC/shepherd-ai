     1|     1|import { jsPDF } from "jspdf";
     2|     2|
     3|     3|interface StudyData {
     4|     4|  passage_reference: string;
     5|     5|  passage_text: string;
     6|     6|  historical_context?: string;
     7|     7|  verse_breakdown?: {
     8|     8|    verse: string;
     9|     9|    text: string;
    10|    10|    explanation: string;
    11|    11|    cross_references: string[];
    12|    12|    word_study?: string;
    13|    13|  }[];
    14|    14|  key_themes?: string[];
    15|    15|  application_questions?: string[];
    16|    16|  prayer_prompt?: string;
    17|    17|}
    18|    18|
    19|    19|interface StudyResponse {
    20|    20|  success: boolean;
    21|    21|  reference: string;
    22|    22|  translation: string;
    23|    23|  study: StudyData;
    24|    24|}
    25|    25|
    26|    26|/** Generate a formatted PDF of a Bible study and trigger download */
    27|    27|export function downloadStudyPDF(study: StudyResponse): void {
    28|    28|  const s = study.study;
    29|    29|  const doc = new jsPDF({ unit: "mm", format: "a4" });
    30|    30|
    31|    31|  const MARGIN = 20;
    32|    32|  const WIDTH = doc.internal.pageSize.getWidth() - MARGIN * 2;
    33|    33|
  // Strip unsupported Unicode characters (emojis, smart quotes, etc.)
  // Helvetica only supports basic Latin + some extensions
  function sanitize(text: string): string {
    return text
      .replace(/[\u2018\u2019]/g, "'")   // smart single quotes → straight
      .replace(/[\u201C\u201D]/g, '"')   // smart double quotes → straight
      .replace(/\u2013|\u2014/g, '-')    // en/em dash → hyphen
      .replace(/\u2026/g, '...')           // ellipsis → three dots
      .replace(/\u00A0/g, ' ')             // non-breaking space → regular space
      .replace(/[\u200B\u200C\u200D]/g, '') // zero-width chars → remove
      .replace(/[^\x20-\x7E\xA0-\xFF\u0152\u0153\u0160\u0161\u0178\u0192\u02C6\u02DC\u2010\u2012\u2015\u2018-\u2022\u2026\u2030\u2032\u2033\u2039\u203A\u20AC\u2122\u2212]/g, '');
  }

  let y = 25;
    34|    34|
    35|    35|  // Helper: add text with auto-wrapping
    36|    36|  function addText(
    37|    37|    text: string,
    38|    38|    opts: { size?: number; bold?: boolean; color?: string; align?: "left" | "center" } = {}
    39|    39|  ): number {
    40|    40|    const { size = 10, bold = false, color = "#1a1a1a" } = opts;
    41|    41|    doc.setFontSize(size);
    42|    42|    doc.setFont("Helvetica", bold ? "bold" : "normal");
    43|    43|    doc.setTextColor(color);
    44|    44|    const clean = sanitize(text);
    const lines = doc.splitTextToSize(clean, WIDTH);
    45|    45|    const lineHeight = size * 0.42;
    46|    46|    for (const line of lines) {
    47|    47|      if (y > 270) {
    48|    48|        doc.addPage();
    49|    49|        y = MARGIN;
    50|    50|      }
    51|    51|      doc.text(line, MARGIN, y, { align: opts.align || "left" });
    52|    52|      y += lineHeight;
    53|    53|    }
    54|    54|    y += 2;
    55|    55|    return y;
    56|    56|  }
    57|    57|
    58|    58|  function addHR(): void {
    59|    59|    if (y > 270) {
    60|    60|      doc.addPage();
    61|    61|      y = MARGIN;
    62|    62|    }
    63|    63|    doc.setDrawColor(200, 200, 200);
    64|    64|    doc.line(MARGIN, y, MARGIN + WIDTH, y);
    65|    65|    y += 5;
    66|    66|  }
    67|    67|
    68|    68|  function addSection(title: string): void {
    69|    69|    if (y > 260) {
    70|    70|      doc.addPage();
    71|    71|      y = MARGIN;
    72|    72|    }
    73|    73|    addHR();
    74|    74|    doc.setFontSize(13);
    75|    75|    doc.setFont("Helvetica", "bold");
    76|    76|    doc.setTextColor("#1a1a1a");
    77|    77|    doc.text(title, MARGIN, y);
    78|    78|    y += 8;
    79|    79|  }
    80|    80|
    81|    81|  // ─── Header ───
    82|    82|  doc.setFontSize(20);
    83|    83|  doc.setFont("Helvetica", "bold");
    84|    84|  doc.setTextColor("#0d47a1");
    85|    85|  doc.text("Shepherd AI", MARGIN, y);
    86|    86|  y += 10;
    87|    87|
    88|    88|  doc.setFontSize(11);
    89|    89|  doc.setFont("Helvetica", "normal");
    90|    90|  doc.setTextColor("#555555");
    91|    91|  doc.text("KJV Bible Study", MARGIN, y);
    92|    92|  y += 10;
    93|    93|
    94|    94|  // ─── Passage Reference ───
    95|    95|  addHR();
    96|    96|  addText(s.passage_reference, { size: 16, bold: true, color: "#0d47a1" });
    97|    97|  y += 2;
    98|    98|
    99|    99|  // ─── KJV Passage Text ───
   100|   100|  doc.setFont("Courier", "normal");
   101|   101|  doc.setFontSize(10);
   102|   102|  doc.setTextColor("#333333");
   103|   103|  const verseLines = doc.splitTextToSize(s.passage_text, WIDTH - 10);
   104|   104|  for (const line of verseLines) {
   105|   105|    if (y > 270) {
   106|   106|      doc.addPage();
   107|   107|      y = MARGIN;
   108|   108|    }
   109|   109|    doc.text(line, MARGIN + 5, y);
   110|   110|    y += 5;
   111|   111|  }
   112|   112|  y += 4;
   113|   113|
   114|   114|  // ─── Historical Context ───
   115|   115|  if (s.historical_context) {
   116|   116|    addSection("Historical Context");
   117|   117|    addText(s.historical_context);
   118|   118|  }
   119|   119|
   120|   120|  // ─── Verse-by-Verse Study ───
   121|   121|  if (s.verse_breakdown && s.verse_breakdown.length > 0) {
   122|   122|    addSection("Verse-by-Verse Study");
   123|   123|
   124|   124|    for (const v of s.verse_breakdown) {
   125|   125|      if (y > 240) {
   126|   126|        doc.addPage();
   127|   127|        y = MARGIN;
   128|   128|      }
   129|   129|
   130|   130|      // Verse reference
   131|   131|      doc.setFontSize(11);
   132|   132|      doc.setFont("Helvetica", "bold");
   133|   133|      doc.setTextColor("#0d47a1");
   134|   134|      doc.text(v.verse, MARGIN, y);
   135|   135|      y += 6;
   136|   136|
   137|   137|      // KJV text
   138|   138|      if (v.text) {
   139|   139|        doc.setFont("Courier", "italic");
   140|   140|        doc.setFontSize(9);
   141|   141|        doc.setTextColor("#555555");
   142|   142|        const tLines = doc.splitTextToSize(sanitize(v.text), WIDTH - 10);
   143|   143|        for (const line of tLines) {
   144|   144|          if (y > 270) {
   145|   145|            doc.addPage();
   146|   146|            y = MARGIN;
   147|   147|          }
   148|   148|          doc.text(line, MARGIN + 5, y);
   149|   149|          y += 4.5;
   150|   150|        }
   151|   151|        y += 1;
   152|   152|      }
   153|   153|
   154|   154|      // Explanation
   155|   155|      if (v.explanation) {
   156|   156|        addText(v.explanation, { size: 9, color: "#333333" });
   157|   157|      }
   158|   158|
   159|   159|      // Word study
   160|   160|      if (v.word_study) {
   161|   161|        doc.setFontSize(9);
   162|   162|        doc.setFont("Helvetica", "italic");
   163|   163|        doc.setTextColor("#6a1b9a");
   164|   164|        const wsLines = doc.splitTextToSize(`[Word Study] ${sanitize(v.word_study)}`, WIDTH - 10);
   165|   165|        for (const line of wsLines) {
   166|   166|          if (y > 270) {
   167|   167|            doc.addPage();
   168|   168|            y = MARGIN;
   169|   169|          }
   170|   170|          doc.text(line, MARGIN + 5, y);
   171|   171|          y += 4.5;
   172|   172|        }
   173|   173|        y += 1;
   174|   174|      }
   175|   175|
   176|   176|      y += 3;
   177|   177|    }
   178|   178|  }
   179|   179|
   180|   180|  // ─── Key Themes ───
   181|   181|  if (s.key_themes && s.key_themes.length > 0) {
   182|   182|    addSection("Key Themes");
   183|   183|    for (const theme of s.key_themes) {
   184|   184|      addText(`\u2022  ${theme}`, { size: 10 });
   185|   185|    }
   186|   186|  }
   187|   187|
   188|   188|  // ─── Application Questions ───
   189|   189|  if (s.application_questions && s.application_questions.length > 0) {
   190|   190|    addSection("Application Questions");
   191|   191|    s.application_questions.forEach((q, i) => {
   192|   192|      addText(`${i + 1}.  ${q}`, { size: 10 });
   193|   193|    });
   194|   194|  }
   195|   195|
   196|   196|  // ─── Prayer Prompt ───
   197|   197|  if (s.prayer_prompt) {
   198|   198|    addSection("Prayer Prompt");
   199|   199|    addText(s.prayer_prompt, { size: 10, color: "#555555" });
   200|   200|    y += 3;
   201|   201|  }
   202|   202|
   203|   203|  // ─── Footer ───
   204|   204|  addHR();
   205|   205|  doc.setFontSize(8);
   206|   206|  doc.setFont("Helvetica", "italic");
   207|   207|  doc.setTextColor("#999999");
   208|   208|  const footerText = `Generated by Shepherd AI  -  shepherd-ai-chi.vercel.app  \u2022  ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;
   209|   209|  doc.text(footerText, MARGIN, y, { align: "left" });
   210|   210|
   211|   211|  // Download
   212|   212|  const filename = `Shepherd_AI_${s.passage_reference.replace(/\s+/g, "_")}.pdf`;
   213|   213|  doc.save(filename);
   214|   214|}
   215|   215|