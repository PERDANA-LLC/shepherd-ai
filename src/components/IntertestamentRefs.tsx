"use client";

/**
 * Intertestament References — React Component
 * 
 * Shows how the Old and New Testaments speak to each other about a passage.
 * For any Bible reference, displays:
 * - What the OT says (foundations, prophecies, types)
 * - What the NT says (fulfillments, quotes, expansions)
 * - AI-generated "How Christ Fulfills This" analysis
 */

import { useState, useEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────

type ConnectionType = "direct_quote" | "fulfillment" | "typology" | "allusion" | "thematic";

interface ConnectionRef {
  reference: string;
  text: string | null;
  context: string;
  type: ConnectionType;
}

interface ConnectionEntry {
  id: string;
  theme: string;
  description: string;
  howChristFulfills: string | null;
  oldTestament: ConnectionRef[];
  newTestament: ConnectionRef[];
}

interface AIGenerated {
  theme: string;
  description: string;
  howChristFulfills: string | null;
  oldTestament: { reference: string; context: string; type: ConnectionType }[];
  newTestament: { reference: string; context: string; type: ConnectionType }[];
}

interface Props {
  passage: string;
  focus?: "christological" | "trinitarian" | "theological";
  className?: string;
}

// ─── Badge Styles ──────────────────────────────────────────────

const TYPE_STYLES: Record<ConnectionType, { label: string; emoji: string; color: string }> = {
  direct_quote: { label: "Direct Quote", emoji: "🗣️", color: "#4a90d9" },
  fulfillment: { label: "Fulfillment", emoji: "✅", color: "#3fb950" },
  typology: { label: "Typology", emoji: "🔗", color: "#a371f7" },
  allusion: { label: "Allusion", emoji: "💭", color: "#d2991d" },
  thematic: { label: "Thematic", emoji: "📖", color: "#8b949e" }
};

// ─── Component ─────────────────────────────────────────────────

export default function IntertestamentRefs({ passage, focus = "christological", className = "" }: Props) {
  const [entries, setEntries] = useState<ConnectionEntry[]>([]);
  const [aiGenerated, setAiGenerated] = useState<AIGenerated | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);

  // Load curated connections
  useEffect(() => {
    if (!passage) return;
    setLoading(true);
    setError(null);

    fetch(`/api/intertestament?passage=${encodeURIComponent(passage)}`)
      .then(res => res.json())
      .then(data => {
        setEntries(data.connections || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : "Failed to load");
        setLoading(false);
      });
  }, [passage]);

  // AI generate
  const generateAI = async () => {
    setGenerating(true);
    setAiGenerated(null);
    try {
      const res = await fetch(`/api/intertestament?passage=${encodeURIComponent(passage)}&ai=true&focus=${focus}`);
      const data = await res.json();
      if (data.aiGenerated) {
        setAiGenerated(data.aiGenerated);
        setShowAI(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const testament = /^(1|2)?\s*(Samuel|Kings|Chronicles|Isaiah|Jeremiah|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Esther|Job|Psalms?|Psalm|Proverbs|Ecclesiastes|Song of Solomon|Lamentations)/i.test(passage)
    ? "OT" : "NT";

  // ─── Render ──────────────────────────────────────────────

  return (
    <div className={`intertestament ${className}`}>
      {/* Header */}
      <div className="it-header">
        <h3 className="it-title">
          <span className="it-icon">📜</span>
          What the Testaments Say
        </h3>
        <p className="it-subtitle">
          {testament === "OT"
            ? `How the New Testament quotes, fulfills, and interprets ${passage}`
            : `How the Old Testament lays the foundation for ${passage}`}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="it-error">
          ⚠️ {error}
          <button onClick={() => setError(null)} className="it-dismiss">×</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="it-loading">
          <span className="it-spinner" /> Searching across both testaments...
        </div>
      )}

      {/* No results */}
      {!loading && entries.length === 0 && !aiGenerated && (
        <div className="it-empty">
          <div className="it-empty-icon">📜📖</div>
          <p>No curated connections found for {passage}.</p>
          <button
            onClick={generateAI}
            disabled={generating}
            className="it-generate-btn"
          >
            {generating ? (
              <><span className="it-spinner" /> Generating...</>
            ) : (
              <>🤖 AI-Generate Intertestament References</>
            )}
          </button>
        </div>
      )}

      {/* Curated connections */}
      {!loading && entries.map(entry => (
        <div key={entry.id} className="it-entry">
          {/* Entry header */}
          <button
            className="it-entry-header"
            onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
          >
            <div className="it-entry-theme">{entry.theme}</div>
            <div className="it-entry-meta">
              <span className="it-entry-count ot">{entry.oldTestament.length} OT</span>
              <span className="it-entry-count nt">{entry.newTestament.length} NT</span>
              <span className={`it-expand-arrow ${expandedEntry === entry.id ? "open" : ""}`}>▼</span>
            </div>
          </button>

          {expandedEntry === entry.id && (
            <div className="it-entry-body">
              <p className="it-entry-desc">{entry.description}</p>

              {/* OT References */}
              {entry.oldTestament.length > 0 && (
                <div className="it-section">
                  <div className="it-section-label">
                    <span className="it-section-icon">📜</span>
                    Old Testament Foundation
                  </div>
                  <div className="it-refs">
                    {entry.oldTestament.map((ref, i) => {
                      const style = TYPE_STYLES[ref.type] || TYPE_STYLES.thematic;
                      return (
                        <div key={i} className="it-ref">
                          <div className="it-ref-header">
                            <span className="it-ref-reference">{ref.reference}</span>
                            <span className="it-ref-type" style={{ color: style.color }}>
                              {style.emoji} {style.label}
                            </span>
                          </div>
                          <p className="it-ref-context">{ref.context}</p>
                          {ref.text && (
                            <blockquote className="it-ref-text">&ldquo;{ref.text}&rdquo;</blockquote>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* NT References */}
              {entry.newTestament.length > 0 && (
                <div className="it-section">
                  <div className="it-section-label">
                    <span className="it-section-icon">✝️</span>
                    New Testament Fulfillment
                  </div>
                  <div className="it-refs">
                    {entry.newTestament.map((ref, i) => {
                      const style = TYPE_STYLES[ref.type] || TYPE_STYLES.thematic;
                      return (
                        <div key={i} className="it-ref nt-ref">
                          <div className="it-ref-header">
                            <span className="it-ref-reference">{ref.reference}</span>
                            <span className="it-ref-type" style={{ color: style.color }}>
                              {style.emoji} {style.label}
                            </span>
                          </div>
                          <p className="it-ref-context">{ref.context}</p>
                          {ref.text && (
                            <blockquote className="it-ref-text">&ldquo;{ref.text}&rdquo;</blockquote>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* AI Generation button */}
      {entries.length > 0 && !aiGenerated && (
        <button
          onClick={generateAI}
          disabled={generating}
          className="it-generate-btn"
        >
          {generating ? (
            <><span className="it-spinner" /> Generating AI analysis...</>
          ) : (
            <>🤖 AI: How Christ Fulfills {passage}</>
          )}
        </button>
      )}

      {/* AI Generated */}
      {aiGenerated && (
        <div className="it-ai-entry">
          <div className="it-ai-badge">🤖 AI-Generated Analysis</div>
          
          <h4 className="it-ai-theme">{aiGenerated.theme}</h4>
          <p className="it-ai-desc">{aiGenerated.description}</p>

          {aiGenerated.howChristFulfills && (
            <div className="it-christ-section">
              <div className="it-christ-label">✝️ How Christ Fulfills This</div>
              <p className="it-christ-text">{aiGenerated.howChristFulfills}</p>
            </div>
          )}

          {/* AI OT */}
          {aiGenerated.oldTestament.length > 0 && (
            <div className="it-ai-section">
              <div className="it-ai-section-label">📜 OT References</div>
              {aiGenerated.oldTestament.map((ref, i) => {
                const style = TYPE_STYLES[ref.type] || TYPE_STYLES.thematic;
                return (
                  <div key={i} className="it-ai-ref">
                    <div className="it-ai-ref-header">
                      <span className="it-ref-reference">{ref.reference}</span>
                      <span style={{ color: style.color, fontSize: "0.7rem" }}>{style.emoji} {style.label}</span>
                    </div>
                    <p className="it-ref-context">{ref.context}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* AI NT */}
          {aiGenerated.newTestament.length > 0 && (
            <div className="it-ai-section">
              <div className="it-ai-section-label">✝️ NT References</div>
              {aiGenerated.newTestament.map((ref, i) => {
                const style = TYPE_STYLES[ref.type] || TYPE_STYLES.thematic;
                return (
                  <div key={i} className="it-ai-ref">
                    <div className="it-ai-ref-header">
                      <span className="it-ref-reference">{ref.reference}</span>
                      <span style={{ color: style.color, fontSize: "0.7rem" }}>{style.emoji} {style.label}</span>
                    </div>
                    <p className="it-ref-context">{ref.context}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .intertestament {
          background: linear-gradient(135deg, #1a1a2e 0%, #1a1a3a 100%);
          border-radius: 12px;
          padding: 20px;
          color: #e0e0e0;
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* Header */
        .it-header { margin-bottom: 16px; }
        .it-title {
          margin: 0 0 4px;
          font-size: 1.1rem;
          color: #d2991d;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .it-icon { font-size: 1.2rem; }
        .it-subtitle {
          margin: 0;
          font-size: 0.85rem;
          color: #888;
        }

        /* Error */
        .it-error {
          background: #3a1a1a;
          border: 1px solid #6b2020;
          border-radius: 8px;
          padding: 10px 12px;
          margin-bottom: 12px;
          font-size: 0.85rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .it-dismiss {
          background: none;
          border: none;
          color: #888;
          font-size: 1.1rem;
          cursor: pointer;
        }

        /* Loading */
        .it-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 20px;
          color: #888;
          justify-content: center;
        }
        .it-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #2a2a4a;
          border-top-color: #d2991d;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Empty */
        .it-empty {
          text-align: center;
          padding: 30px 20px;
          color: #888;
        }
        .it-empty-icon { font-size: 2rem; margin-bottom: 8px; }

        /* Buttons */
        .it-generate-btn {
          width: 100%;
          margin-top: 12px;
          padding: 10px;
          background: linear-gradient(135deg, #2a2a4a, #3a3a5a);
          border: 1px solid #4a4a6a;
          border-radius: 8px;
          color: #d2991d;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .it-generate-btn:hover:not(:disabled) {
          border-color: #d2991d;
        }
        .it-generate-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Entry cards */
        .it-entry {
          margin-bottom: 8px;
          border: 1px solid #2a2a4a;
          border-radius: 8px;
          overflow: hidden;
        }
        .it-entry-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          background: #16162a;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s;
        }
        .it-entry-header:hover { background: #1c1c32; }
        .it-entry-theme {
          font-weight: 600;
          font-size: 0.9rem;
          color: #e0e0e0;
        }
        .it-entry-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .it-entry-count {
          font-size: 0.7rem;
          padding: 2px 8px;
          border-radius: 10px;
          font-family: monospace;
        }
        .it-entry-count.ot {
          background: #2a2a4a;
          color: #d2991d;
        }
        .it-entry-count.nt {
          background: #2a2a4a;
          color: #4a90d9;
        }
        .it-expand-arrow {
          font-size: 0.7rem;
          color: #666;
          transition: transform 0.2s;
        }
        .it-expand-arrow.open { transform: rotate(180deg); }

        /* Entry body */
        .it-entry-body {
          padding: 14px;
          border-top: 1px solid #2a2a4a;
          background: #16162a;
        }
        .it-entry-desc {
          margin: 0 0 14px;
          font-size: 0.85rem;
          color: #aaa;
          line-height: 1.5;
        }

        /* Sections */
        .it-section { margin-bottom: 14px; }
        .it-section-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #888;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .it-section-icon { font-size: 1rem; }

        /* Reference cards */
        .it-refs {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .it-ref {
          padding: 10px;
          background: #1a1a2e;
          border-radius: 6px;
          border-left: 3px solid #d2991d;
        }
        .it-ref.nt-ref { border-left-color: #4a90d9; }
        .it-ref-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .it-ref-reference {
          font-family: monospace;
          font-size: 0.85rem;
          color: #e0e0e0;
          font-weight: 500;
        }
        .it-ref-type {
          font-size: 0.7rem;
        }
        .it-ref-context {
          margin: 0 0 4px;
          font-size: 0.8rem;
          color: #aaa;
          line-height: 1.4;
        }
        .it-ref-text {
          margin: 4px 0 0;
          padding: 6px 10px;
          background: #0d1117;
          border-left: 2px solid #30363d;
          border-radius: 4px;
          font-size: 0.82rem;
          color: #ccc;
          font-style: italic;
          line-height: 1.4;
        }

        /* AI Section */
        .it-ai-entry {
          margin-top: 16px;
          padding: 16px;
          background: #16162a;
          border: 1px solid #4a90d9;
          border-radius: 10px;
        }
        .it-ai-badge {
          font-size: 0.8rem;
          color: #4a90d9;
          margin-bottom: 8px;
        }
        .it-ai-theme {
          margin: 0 0 6px;
          color: #e0e0e0;
          font-size: 1rem;
        }
        .it-ai-desc {
          margin: 0 0 12px;
          font-size: 0.85rem;
          color: #aaa;
          line-height: 1.5;
        }
        .it-christ-section {
          background: linear-gradient(135deg, #1a1a30, #1c1c35);
          border: 1px solid #d2991d33;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 14px;
        }
        .it-christ-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #d2991d;
          margin-bottom: 6px;
        }
        .it-christ-text {
          margin: 0;
          font-size: 0.85rem;
          color: #ccc;
          line-height: 1.5;
        }
        .it-ai-section { margin-bottom: 12px; }
        .it-ai-section-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #888;
          margin-bottom: 6px;
        }
        .it-ai-ref {
          padding: 8px 10px;
          background: #1a1a2e;
          border-radius: 6px;
          margin-bottom: 4px;
          border-left: 3px solid #30363d;
        }
        .it-ai-ref-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3px;
        }
      `}</style>
    </div>
  );
}
