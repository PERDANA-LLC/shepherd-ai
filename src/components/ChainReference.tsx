"use client";

/**
 * Thompson Chain Reference — React Component
 * 
 * Displays cross-reference chains for a given Bible passage.
 * Features:
 * - Curated chain topics (50+ built-in)
 * - AI-generated custom chains
 * - Chain navigation (prev/next verse)
 * - Verse text display with KJV lookup
 * - Search by keyword or category
 */

import { useState, useEffect, useCallback } from "react";

// ─── Types ─────────────────────────────────────────────────────

interface ChainVerse {
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  text: string | null;
  position: number;
  isCurrent: boolean;
}

interface ChainSummary {
  id: number;
  name: string;
  description: string;
  category: string;
  verseCount?: number;
  firstVerses?: string[];
  position?: number;
  totalVerses?: number;
}

interface ChainDetail {
  chain: {
    id: number;
    name: string;
    description: string;
    category: string;
    verseCount: number;
  };
  verses: ChainVerse[];
  currentIndex?: number;
  hasPrev?: boolean;
  hasNext?: boolean;
}

interface GeneratedChain {
  chain: {
    name: string;
    description: string;
    category: string;
    verses: { reference: string; relevance: string }[];
  };
}

interface Props {
  passage: string;
  focus?: "christological" | "trinitarian" | "theological";
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────

export default function ChainReference({ passage, focus = "christological", className = "" }: Props) {
  const [chains, setChains] = useState<ChainSummary[]>([]);
  const [selectedChain, setSelectedChain] = useState<ChainDetail | null>(null);
  const [generatedChain, setGeneratedChain] = useState<GeneratedChain | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChainSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"related" | "browse" | "search">("related");

  // Load chains related to this verse
  const loadRelatedChains = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/chain?verse=${encodeURIComponent(passage)}`);
      if (!res.ok) throw new Error("Failed to load chains");
      const data = await res.json();
      setChains(data.chains || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [passage]);

  useEffect(() => {
    if (passage) loadRelatedChains();
  }, [passage, loadRelatedChains]);

  // Load full chain detail
  const loadChainDetail = async (chainId: number) => {
    setLoading(true);
    setSelectedChain(null);
    try {
      const res = await fetch(`/api/chain?id=${chainId}&verse=${encodeURIComponent(passage)}`);
      if (!res.ok) throw new Error("Failed to load chain");
      const data = await res.json();
      setSelectedChain(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  // Search chains
  const searchChains = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearchResults([]);
    try {
      const res = await fetch(`/api/chain?topic=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setSearchResults(data.chains || []);
      setActiveTab("search");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  // AI-generate custom chain
  const generateChain = async () => {
    setGenerating(true);
    setGeneratedChain(null);
    try {
      const res = await fetch("/api/chain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passage, focus })
      });
      const data = await res.json();
      if (data.generated) {
        setGeneratedChain(data);
      }
      // Also show curated chains
      if (data.curatedChains?.length) {
        setChains(data.curatedChains);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const focusEmoji: Record<string, string> = {
    christological: "✝️",
    trinitarian: "🔺",
    theological: "🏛️"
  };

  // ─── Render ──────────────────────────────────────────────

  return (
    <div className={`chain-reference ${className}`}>
      {/* Header */}
      <div className="chain-header">
        <h3 className="chain-title">
          <span className="chain-icon">🔗</span>
          Chain Reference
        </h3>
        <p className="chain-subtitle">
          Thompson-style cross-reference chains for {passage}
        </p>
      </div>

      {/* Tabs */}
      <div className="chain-tabs">
        <button
          className={`chain-tab ${activeTab === "related" ? "active" : ""}`}
          onClick={() => setActiveTab("related")}
        >
          📖 Related ({chains.length})
        </button>
        <button
          className={`chain-tab ${activeTab === "browse" ? "active" : ""}`}
          onClick={() => setActiveTab("browse")}
        >
          🗂️ Browse All
        </button>
        <button
          className={`chain-tab ${activeTab === "search" ? "active" : ""}`}
          onClick={() => setActiveTab("search")}
        >
          🔍 Search
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="chain-error">
          ⚠️ {error}
          <button onClick={() => setError(null)} className="chain-dismiss">×</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="chain-loading">
          <span className="chain-spinner" /> Loading chains...
        </div>
      )}

      {/* ── Related Chains tab ── */}
      {activeTab === "related" && !loading && (
        <div className="chain-related">
          {chains.length === 0 ? (
            <div className="chain-empty">
              <p>No curated chains found for {passage}.</p>
              <button
                onClick={generateChain}
                disabled={generating}
                className="chain-generate-btn"
              >
                {generating ? (
                  <><span className="chain-spinner" /> Generating...</>
                ) : (
                  <>🤖 AI-Generate Chain for {passage}</>
                )}
              </button>
            </div>
          ) : (
            <>
              <div className="chain-list">
                {chains.map(chain => (
                  <button
                    key={chain.id}
                    className="chain-card"
                    onClick={() => loadChainDetail(chain.id)}
                  >
                    <div className="chain-card-header">
                      <span className="chain-card-id">#{chain.id}</span>
                      <span className="chain-card-category">{chain.category}</span>
                    </div>
                    <div className="chain-card-name">{chain.name}</div>
                    <div className="chain-card-desc">{chain.description}</div>
                    <div className="chain-card-meta">
                      <span>{chain.totalVerses ?? chain.verseCount} verses</span>
                      {chain.position && (
                        <span className="chain-position">
                          Verse {chain.position} of {chain.totalVerses}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={generateChain}
                disabled={generating}
                className="chain-generate-btn"
              >
                {generating ? (
                  <><span className="chain-spinner" /> Generating...</>
                ) : (
                  <>🤖 AI-Generate New Chain</>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Browse All tab ── */}
      {activeTab === "browse" && !loading && (
        <div className="chain-search-area">
          <div className="chain-search-box">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchChains()}
              placeholder="Search by topic (e.g., faith, love, prayer)..."
              className="chain-search-input"
            />
            <button onClick={searchChains} className="chain-search-btn">🔍</button>
          </div>
          {searchResults.length > 0 && (
            <div className="chain-list">
              {searchResults.map(chain => (
                <button
                  key={chain.id}
                  className="chain-card"
                  onClick={() => loadChainDetail(chain.id)}
                >
                  <div className="chain-card-header">
                    <span className="chain-card-id">#{chain.id}</span>
                    <span className="chain-card-category">{chain.category}</span>
                  </div>
                  <div className="chain-card-name">{chain.name}</div>
                  <div className="chain-card-desc">{chain.description}</div>
                  <div className="chain-card-meta">
                    {chain.verseCount && <span>{chain.verseCount} verses</span>}
                    {chain.firstVerses && (
                      <span className="chain-first-verses">
                        {chain.firstVerses.join(" · ")}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Search tab ── */}
      {activeTab === "search" && (
        <div className="chain-search-area">
          <div className="chain-search-box">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchChains()}
              placeholder="Search by topic (e.g., faith, love, prayer)..."
              className="chain-search-input"
            />
            <button onClick={searchChains} className="chain-search-btn">🔍</button>
          </div>
          {searchResults.length > 0 && (
            <div className="chain-list">
              {searchResults.map(chain => (
                <button
                  key={chain.id}
                  className="chain-card"
                  onClick={() => loadChainDetail(chain.id)}
                >
                  <div className="chain-card-header">
                    <span className="chain-card-id">#{chain.id}</span>
                    <span className="chain-card-category">{chain.category}</span>
                  </div>
                  <div className="chain-card-name">{chain.name}</div>
                  <div className="chain-card-desc">{chain.description}</div>
                </button>
              ))}
            </div>
          )}
          {searchResults.length === 0 && searchQuery && !loading && (
            <div className="chain-empty">
              <p>No chains found for &ldquo;{searchQuery}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {/* ── Chain Detail (modal / inline) ── */}
      {selectedChain && (
        <div className="chain-detail">
          <div className="chain-detail-header">
            <button
              onClick={() => setSelectedChain(null)}
              className="chain-back-btn"
            >
              ← Back
            </button>
            <div>
              <div className="chain-detail-category">{selectedChain.chain.category}</div>
              <h4 className="chain-detail-name">#{selectedChain.chain.id} {selectedChain.chain.name}</h4>
              <p className="chain-detail-desc">{selectedChain.chain.description}</p>
            </div>
          </div>

          {/* Chain navigation */}
          <div className="chain-nav">
            <span className="chain-nav-info">
              {selectedChain.chain.verseCount} verses in chain
            </span>
          </div>

          {/* Verse list */}
          <div className="chain-verses">
            {selectedChain.verses.map((v, i) => (
              <div
                key={i}
                className={`chain-verse ${v.isCurrent ? "current" : ""}`}
                id={v.isCurrent ? "chain-current-verse" : undefined}
              >
                <div className="chain-verse-header">
                  <span className="chain-verse-num">{v.position + 1}</span>
                  <span className="chain-verse-ref">{v.reference}</span>
                  {v.isCurrent && (
                    <span className="chain-verse-badge">📍 Current</span>
                  )}
                </div>
                {v.text && (
                  <div className="chain-verse-text">&ldquo;{v.text}&rdquo;</div>
                )}
                {!v.text && (
                  <div className="chain-verse-loading">Loading text...</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Generated Chain ── */}
      {generatedChain && (
        <div className="chain-generated">
          <div className="chain-generated-badge">🤖 AI-Generated Chain</div>
          <h4 className="chain-generated-name">{generatedChain.chain.name}</h4>
          <p className="chain-generated-desc">{generatedChain.chain.description}</p>
          <div className="chain-generated-category">
            {focusEmoji[focus]} {generatedChain.chain.category} · {focus} focus
          </div>
          <div className="chain-verses">
            {generatedChain.chain.verses.map((v, i) => (
              <div key={i} className="chain-verse ai-generated">
                <div className="chain-verse-header">
                  <span className="chain-verse-num">{i + 1}</span>
                  <span className="chain-verse-ref">{v.reference}</span>
                </div>
                <div className="chain-verse-relevance">{v.relevance}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .chain-reference {
          background: #1a1a2e;
          border-radius: 12px;
          padding: 20px;
          color: #e0e0e0;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .chain-header {
          margin-bottom: 16px;
        }
        .chain-title {
          margin: 0 0 4px;
          font-size: 1.1rem;
          color: #c9a94e;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .chain-icon { font-size: 1.2rem; }
        .chain-subtitle {
          margin: 0;
          font-size: 0.85rem;
          color: #888;
        }

        /* Tabs */
        .chain-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 12px;
          border-bottom: 1px solid #2a2a4a;
        }
        .chain-tab {
          padding: 8px 14px;
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 0.85rem;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        .chain-tab:hover { color: #c9a94e; }
        .chain-tab.active {
          color: #c9a94e;
          border-bottom-color: #c9a94e;
        }

        /* Error */
        .chain-error {
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
        .chain-dismiss {
          background: none;
          border: none;
          color: #888;
          font-size: 1.1rem;
          cursor: pointer;
        }

        /* Loading */
        .chain-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 20px;
          color: #888;
          justify-content: center;
        }
        .chain-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #2a2a4a;
          border-top-color: #c9a94e;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
          vertical-align: middle;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Chain Cards */
        .chain-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .chain-card {
          background: #16162a;
          border: 1px solid #2a2a4a;
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }
        .chain-card:hover {
          border-color: #c9a94e;
          background: #1c1c32;
        }
        .chain-card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .chain-card-id {
          font-family: monospace;
          color: #c9a94e;
          font-size: 0.8rem;
        }
        .chain-card-category {
          font-size: 0.75rem;
          background: #2a2a4a;
          padding: 2px 8px;
          border-radius: 10px;
          color: #aaa;
        }
        .chain-card-name {
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 2px;
          color: #e0e0e0;
        }
        .chain-card-desc {
          font-size: 0.8rem;
          color: #888;
          margin-bottom: 6px;
        }
        .chain-card-meta {
          display: flex;
          gap: 12px;
          font-size: 0.75rem;
          color: #666;
        }
        .chain-position { color: #c9a94e; }
        .chain-first-verses {
          color: #666;
          font-family: monospace;
          font-size: 0.7rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Empty state */
        .chain-empty {
          text-align: center;
          padding: 20px;
          color: #888;
        }

        /* Generate button */
        .chain-generate-btn {
          width: 100%;
          margin-top: 12px;
          padding: 10px;
          background: linear-gradient(135deg, #2a2a4a, #3a3a5a);
          border: 1px solid #4a4a6a;
          border-radius: 8px;
          color: #c9a94e;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .chain-generate-btn:hover:not(:disabled) {
          border-color: #c9a94e;
          background: linear-gradient(135deg, #3a3a5a, #4a4a6a);
        }
        .chain-generate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Search */
        .chain-search-area {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .chain-search-box {
          display: flex;
          gap: 6px;
        }
        .chain-search-input {
          flex: 1;
          padding: 10px;
          background: #16162a;
          border: 1px solid #2a2a4a;
          border-radius: 8px;
          color: #e0e0e0;
          font-size: 0.9rem;
        }
        .chain-search-input:focus {
          outline: none;
          border-color: #c9a94e;
        }
        .chain-search-btn {
          padding: 10px 14px;
          background: #2a2a4a;
          border: 1px solid #3a3a5a;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
        }

        /* Chain Detail */
        .chain-detail {
          margin-top: 16px;
          padding: 16px;
          background: #16162a;
          border: 1px solid #2a2a4a;
          border-radius: 10px;
        }
        .chain-detail-header {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          align-items: flex-start;
        }
        .chain-back-btn {
          padding: 6px 10px;
          background: #2a2a4a;
          border: none;
          border-radius: 6px;
          color: #c9a94e;
          cursor: pointer;
          font-size: 0.8rem;
          white-space: nowrap;
        }
        .chain-detail-category {
          font-size: 0.75rem;
          color: #888;
        }
        .chain-detail-name {
          margin: 2px 0;
          color: #c9a94e;
        }
        .chain-detail-desc {
          margin: 0;
          font-size: 0.85rem;
          color: #aaa;
        }
        .chain-nav {
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #2a2a4a;
        }
        .chain-nav-info {
          font-size: 0.8rem;
          color: #666;
        }

        /* Verses */
        .chain-verses {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .chain-verse {
          padding: 10px;
          background: #1a1a2e;
          border-radius: 6px;
          border-left: 3px solid #2a2a4a;
        }
        .chain-verse.current {
          border-left-color: #c9a94e;
          background: #1c1c32;
        }
        .chain-verse.ai-generated {
          border-left-color: #4a90d9;
        }
        .chain-verse-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .chain-verse-num {
          font-family: monospace;
          font-size: 0.7rem;
          color: #c9a94e;
          background: #2a2a4a;
          padding: 1px 6px;
          border-radius: 10px;
        }
        .chain-verse-ref {
          font-family: monospace;
          font-size: 0.85rem;
          color: #e0e0e0;
          font-weight: 500;
        }
        .chain-verse-badge {
          font-size: 0.7rem;
          background: #3a3020;
          color: #c9a94e;
          padding: 1px 6px;
          border-radius: 10px;
        }
        .chain-verse-text {
          font-size: 0.85rem;
          color: #ccc;
          font-style: italic;
          line-height: 1.4;
        }
        .chain-verse-relevance {
          font-size: 0.8rem;
          color: #888;
          font-style: italic;
        }
        .chain-verse-loading {
          font-size: 0.75rem;
          color: #555;
        }

        /* Generated Chain */
        .chain-generated {
          margin-top: 16px;
          padding: 16px;
          background: #1a1a2e;
          border: 1px solid #4a90d9;
          border-radius: 10px;
        }
        .chain-generated-badge {
          font-size: 0.8rem;
          color: #4a90d9;
          margin-bottom: 6px;
        }
        .chain-generated-name {
          margin: 0 0 4px;
          color: #e0e0e0;
        }
        .chain-generated-desc {
          margin: 0 0 8px;
          font-size: 0.85rem;
          color: #aaa;
        }
        .chain-generated-category {
          font-size: 0.75rem;
          color: #666;
          margin-bottom: 12px;
        }
      `}</style>
    </div>
  );
}
