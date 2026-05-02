     1|import { jsPDF } from "jspdf";
     2|
     3|interface StudyData {
     4|  passage_reference: string;
     5|  passage_text: string;
     6|  historical_context?: string;
     7|  verse_breakdown?: {
     8|    verse: string;
     9|    text: string;
    10|    explanation: string;
    11|    cross_references: string[];
    12|    word_study?: string;
    13|  }[];
    14|  key_themes?: string[];
    15|  application_questions?: string[];
    16|  prayer_prompt?: string;
    17|}
    18|
    19|interface StudyResponse {
    20|  success: boolean;
    21|  reference: string;
    22|  translation: string;
    23|  study: StudyData;
    24|}
    25|
    26|/** Generate a formatted PDF of a Bible study and trigger download */
    27|export function downloadStudyPDF(study: StudyResponse): void {
    28|  const s = study.study;
    29|  const doc = new jsPDF({ unit: "mm", format: "a4" });
    30|
    31|  const MARGIN = 20;
    32|  const WIDTH = doc.internal.pageSize.getWidth() - MARGIN * 2;
    33|  let y = 25;
    34|
    35|  // Helper: add text with auto-wrapping
    36|  function addText(
    37|    text: string,
    38|    opts: { size?: number; bold?: boolean; color?: string; align?: "left" | "center" } = {}
    39|  ): number {
    40|    const { size = 10, bold = false, color = "#1a1a1a" } = opts;
    41|    doc.setFontSize(size);
    42|    doc.setFont("Helvetica", bold ? "bold" : "normal");
    43|    doc.setTextColor(color);
    44|    const lines = doc.splitTextToSize(text, WIDTH);
    45|    const lineHeight = size * 0.42;
    46|    for (const line of lines) {
    47|      if (y > 270) {
    48|        doc.addPage();
    49|        y = MARGIN;
    50|      }
    51|      doc.text(line, MARGIN, y, { align: opts.align || "left" });
    52|      y += lineHeight;
    53|    }
    54|    y += 2;
    55|    return y;
    56|  }
    57|
    58|  function addHR(): void {
    59|    if (y > 270) {
    60|      doc.addPage();
    61|      y = MARGIN;
    62|    }
    63|    doc.setDrawColor(200, 200, 200);
    64|    doc.line(MARGIN, y, MARGIN + WIDTH, y);
    65|    y += 5;
    66|  }
    67|
    68|  function addSection(title: string): void {
    69|    if (y > 260) {
    70|      doc.addPage();
    71|      y = MARGIN;
    72|    }
    73|    addHR();
    74|    doc.setFontSize(13);
    75|    doc.setFont("Helvetica", "bold");
    76|    doc.setTextColor("#1a1a1a");
    77|    doc.text(title, MARGIN, y);
    78|    y += 8;
    79|  }
    80|
    81|  // ─── Header ───
    82|  doc.setFontSize(20);
    83|  doc.setFont("Helvetica", "bold");
    84|  doc.setTextColor("#0d47a1");
    85|  doc.text("Shepherd AI", MARGIN, y);
    86|  y += 10;
    87|
    88|  doc.setFontSize(11);
    89|  doc.setFont("Helvetica", "normal");
    90|  doc.setTextColor("#555555");
    91|  doc.text("KJV Bible Study", MARGIN, y);
    92|  y += 10;
    93|
    94|  // ─── Passage Reference ───
    95|  addHR();
    96|  addText(s.passage_reference, { size: 16, bold: true, color: "#0d47a1" });
    97|  y += 2;
    98|
    99|  // ─── KJV Passage Text ───
   100|  doc.setFont("Courier", "normal");
   101|  doc.setFontSize(10);
   102|  doc.setTextColor("#333333");
   103|  const verseLines = doc.splitTextToSize(s.passage_text, WIDTH - 10);
   104|  for (const line of verseLines) {
   105|    if (y > 270) {
   106|      doc.addPage();
   107|      y = MARGIN;
   108|    }
   109|    doc.text(line, MARGIN + 5, y);
   110|    y += 5;
   111|  }
   112|  y += 4;
   113|
   114|  // ─── Historical Context ───
   115|  if (s.historical_context) {
   116|    addSection("Historical Context");
   117|    addText(s.historical_context);
   118|  }
   119|
   120|  // ─── Verse-by-Verse Study ───
   121|  if (s.verse_breakdown && s.verse_breakdown.length > 0) {
   122|    addSection("Verse-by-Verse Study");
   123|
   124|    for (const v of s.verse_breakdown) {
   125|      if (y > 240) {
   126|        doc.addPage();
   127|        y = MARGIN;
   128|      }
   129|
   130|      // Verse reference
   131|      doc.setFontSize(11);
   132|      doc.setFont("Helvetica", "bold");
   133|      doc.setTextColor("#0d47a1");
   134|      doc.text(v.verse, MARGIN, y);
   135|      y += 6;
   136|
   137|      // KJV text
   138|      if (v.text) {
   139|        doc.setFont("Courier", "italic");
   140|        doc.setFontSize(9);
   141|        doc.setTextColor("#555555");
   142|        const tLines = doc.splitTextToSize(v.text, WIDTH - 10);
   143|        for (const line of tLines) {
   144|          if (y > 270) {
   145|            doc.addPage();
   146|            y = MARGIN;
   147|          }
   148|          doc.text(line, MARGIN + 5, y);
   149|          y += 4.5;
   150|        }
   151|        y += 1;
   152|      }
   153|
   154|      // Explanation
   155|      if (v.explanation) {
   156|        addText(v.explanation, { size: 9, color: "#333333" });
   157|      }
   158|
   159|      // Word study
   160|      if (v.word_study) {
   161|        doc.setFontSize(9);
   162|        doc.setFont("Helvetica", "italic");
   163|        doc.setTextColor("#6a1b9a");
   164|        const wsLines = doc.splitTextToSize(`[Word Study] ${v.word_study}`, WIDTH - 10);
   165|        for (const line of wsLines) {
   166|          if (y > 270) {
   167|            doc.addPage();
   168|            y = MARGIN;
   169|          }
   170|          doc.text(line, MARGIN + 5, y);
   171|          y += 4.5;
   172|        }
   173|        y += 1;
   174|      }
   175|
   176|      y += 3;
   177|    }
   178|  }
   179|
   180|  // ─── Key Themes ───
   181|  if (s.key_themes && s.key_themes.length > 0) {
   182|    addSection("Key Themes");
   183|    for (const theme of s.key_themes) {
   184|      addText(`\u2022  ${theme}`, { size: 10 });
   185|    }
   186|  }
   187|
   188|  // ─── Application Questions ───
   189|  if (s.application_questions && s.application_questions.length > 0) {
   190|    addSection("Application Questions");
   191|    s.application_questions.forEach((q, i) => {
   192|      addText(`${i + 1}.  ${q}`, { size: 10 });
   193|    });
   194|  }
   195|
   196|  // ─── Prayer Prompt ───
   197|  if (s.prayer_prompt) {
   198|    addSection("Prayer Prompt");
   199|    addText(s.prayer_prompt, { size: 10, color: "#555555" });
   200|    y += 3;
   201|  }
   202|
   203|  // ─── Footer ───
   204|  addHR();
   205|  doc.setFontSize(8);
   206|  doc.setFont("Helvetica", "italic");
   207|  doc.setTextColor("#999999");
   208|  const footerText = `Generated by Shepherd AI  -  shepherd-ai-chi.vercel.app  \u2022  ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;
   209|  doc.text(footerText, MARGIN, y, { align: "left" });
   210|
   211|  // Download
   212|  const filename = `Shepherd_AI_${s.passage_reference.replace(/\s+/g, "_")}.pdf`;
   213|  doc.save(filename);
   214|}
   215|