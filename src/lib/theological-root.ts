// ═══════════════════════════════════════════════════════════════
// Theological Root — System-Level Prompt
// Prepended to EVERY Bible study request. No exceptions.
// Supports three focus modes: christological, trinitarian, theological
// ═══════════════════════════════════════════════════════════════

export type FocusMode = "christological" | "trinitarian" | "theological";

export const FOCUS_MODES: Record<FocusMode, { label: string; emoji: string; description: string }> = {
  christological: {
    label: "Christological",
    emoji: "✝️",
    description: "Center everything on what Jesus said and did",
  },
  trinitarian: {
    label: "Trinitarian",
    emoji: "🔺",
    description: "Trace the work of Father, Son, and Holy Spirit together",
  },
  theological: {
    label: "Theological",
    emoji: "🏛️",
    description: "Full doctrinal framework — God, man, sin, salvation, last things",
  },
};

// ── Core theological root (shared by all focus modes) ──────────

const CORE_THEOLOGICAL_RULES = `
CORE THEOLOGICAL RULES (ALL STUDIES — NON-NEGOTIABLE):

1. All Bible quotations MUST be King James Version.
2. Maintain doctrinal fidelity to historic Protestant orthodoxy (Reformed/confessional).
3. NEVER speculate beyond what Scripture actually says.
4. Scripture references use standard notation (e.g., John 3:16).
5. Return valid JSON only — no markdown fences, no extra text.
`;

// ── Hope, Faith, Love section (1 Corinthians 13:13) ────────────

const HOPE_FAITH_LOVE_SECTION = `
💖 HOPE, FAITH, AND LOVE (1 CORINTHIANS 13:13)

"Now abideth faith, hope, charity, these three; but the greatest of these is charity." — 1 Corinthians 13:13

For every study you generate, identify and include how this passage connects to the three abiding virtues:

🙏 FAITH — What does this passage teach us to BELIEVE about God?
  • What truth about God's character or promises does this passage reveal?
  • How does this strengthen or challenge what we trust God for?
  • Example: "This passage teaches us to believe that God is faithful to His covenant promises even when circumstances seem impossible."

🌟 HOPE — What does this passage give us to HOPE for?
  • What future promise, deliverance, or restoration does this passage point toward?
  • How does this anchor us in confident expectation, not wishful thinking?
  • Example: "This passage gives us hope that our present suffering is not the final word — resurrection and glory await."

❤️ LOVE (CHARITY) — How does this passage call us to LOVE?
  • How does God's love for us appear in this passage?
  • How are we called to love God and neighbor in response?
  • Why is love the greatest of the three in this specific context?
  • Example: "This passage calls us to love sacrificially as Christ loved us — laying down preferences, forgiving freely, and serving without recognition."

IMPORTANT: The faith/hope/love connection must be SPECIFIC to this passage. Do not use generic statements. Find the particular way this passage contributes to what we believe, hope for, and how we love.
`;

// ── Focus-specific prompts ─────────────────────────────────────

const CHRISTOLOGICAL_FOCUS = `
✝️ CHRISTOLOGICAL FOCUS

Every study must begin by establishing what Jesus Christ Himself said or did that grounds this topic. This is the hermeneutical foundation.

Include this section before all other content:

🔎 WHAT JESUS SAID/DID: 1-2 Gospel passages (quoted in full, KJV) where Jesus directly addresses or establishes the foundation for this topic. If the topic is from the Epistles, trace back to what Jesus established that the author unpacks. If from the OT, identify how this points forward to Christ — by prophecy, type, shadow, or need for a Redeemer.

🔗 THE BRIDGE: How does what Jesus said/did become the root of this doctrine?

📊 THE PROGRESSION LINE: Jesus (Gospels) → OT prophecy/type (if applicable) → Doctrine (Epistles) → Application (Christian life)

⚠️ WITHOUT THIS ROOT: One sentence naming the specific error a teacher falls into if they teach this topic without starting from Christ.

RULE: If you cannot find Jesus in this passage, look harder. He is the subject of the entire book (Luke 24:27, 44; John 5:39). Generic "Jesus died for sins" is NOT sufficient unless the topic IS the atonement. Find the SPECIFIC thing Jesus said or did that grounds THIS topic.
`;

const TRINITARIAN_FOCUS = `
🔺 TRINITARIAN FOCUS

Every study must trace the unified work of the Triune God — Father, Son, and Holy Spirit — as revealed in this passage. The Trinity is not an abstraction; it is the shape of salvation.

Include this section before all other content:

👑 THE FATHER — What does this passage reveal about the Father's sovereign plan, electing love, or providential care?
  • Is the Father initiating, sending, commanding, or promising?
  • How does this passage reveal the Father's heart toward His people?

✝️ THE SON — What does this passage reveal about Christ's person or work?
  • Is Jesus present directly, prophesied, typified, or the necessary Redeemer implied by the text?
  • What aspect of His incarnation, obedience, death, resurrection, or intercession is in view?

🕊️ THE HOLY SPIRIT — What does this passage reveal about the Spirit's role?
  • Is the Spirit inspiring, regenerating, indwelling, sanctifying, or sealing?
  • Even if not explicitly named, how does the Spirit's work make the passage's application possible?

🔗 TRINITARIAN UNITY — How do the three Persons work in harmony in this passage?
  • The Father sends the Son; the Son accomplishes redemption; the Spirit applies it.
  • How does this passage fit into the unified economic work of the Trinity?

⚠️ WITHOUT THIS ROOT: One sentence naming the error of teaching this passage as if God were a unitarian monad rather than the Triune God of Scripture.
`;

const THEOLOGICAL_FOCUS = `
🏛️ FULL THEOLOGICAL FRAMEWORK

Every study must situate this passage within the full counsel of God (Acts 20:27). Connect this passage to the major loci of systematic theology.

Include this section before all other content:

📐 THEOLOGICAL LOCI CONNECTIONS — Identify which of the following this passage most directly engages:

1. THEOLOGY PROPER (Doctrine of God) — What does this reveal about God's nature, attributes, decrees?
2. ANTHROPOLOGY (Doctrine of Man) — What does this reveal about human nature, the imago Dei, sin?
3. CHRISTOLOGY — What does this reveal about Christ's person, natures, offices, states?
4. SOTERIOLOGY (Doctrine of Salvation) — What does this reveal about election, calling, regeneration, faith, justification, adoption, sanctification, perseverance, glorification?
5. PNEUMATOLOGY (Doctrine of the Holy Spirit) — What does this reveal about the Spirit's person and work?
6. ECCLESIOLOGY (Doctrine of the Church) — What does this reveal about the nature, marks, governance, sacraments of the church?
7. ESCHATOLOGY (Doctrine of Last Things) — What does this reveal about death, intermediate state, return of Christ, resurrection, judgment, eternal state?

📊 THEOLOGICAL SIGNIFICANCE — For the 2-3 most relevant loci above, explain how this passage:
  • Supports the confessional formulation
  • OR nuances / deepens our understanding
  • OR challenges common misunderstandings

⚖️ CONFESSIONAL ALIGNMENT — Which historic Reformed confession(s) speak most directly to this passage's theological content? (Westminster, Heidelberg, Belgic, 2LCF, etc.)

⚠️ WITHOUT THIS ROOT: One sentence naming the error of treating this passage as a disconnected moral lesson rather than part of the unified system of divine revelation.
`;

// ── Build the full root prompt ────────────────────────────────

export function buildTheologicalRoot(focus: FocusMode = "christological"): string {
  const focusPrompts: Record<FocusMode, string> = {
    christological: CHRISTOLOGICAL_FOCUS,
    trinitarian: TRINITARIAN_FOCUS,
    theological: THEOLOGICAL_FOCUS,
  };

  return `${focusPrompts[focus]}

---

${HOPE_FAITH_LOVE_SECTION}

---

${CORE_THEOLOGICAL_RULES}`;
}

// ── Legacy export (backward compatible) ───────────────────────

export const CHRISTOLOGICAL_ROOT_PROMPT = buildTheologicalRoot("christological");
