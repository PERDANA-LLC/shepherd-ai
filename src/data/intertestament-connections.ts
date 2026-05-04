/**
 * Intertestament Connections — OT ↔ NT Cross-Reference Index
 * 
 * Each connection links a passage to its cross-testament references:
 * - OT → NT: How the New Testament quotes, fulfills, or expands
 * - NT → OT: What Old Testament foundations the New Testament builds on
 * 
 * Categories:
 * - direct_quote: Explicit NT quotation of OT (e.g., Matthew citing Isaiah)
 * - fulfillment: OT prophecy explicitly fulfilled in NT
 * - typology: OT type/person/event foreshadowing NT fulfillment
 * - allusion: NT allusion or echo of OT theme/language
 * - thematic: Thematic parallel or doctrinal connection
 */

export type ConnectionType = "direct_quote" | "fulfillment" | "typology" | "allusion" | "thematic";

export interface TestamentConnection {
  reference: string;
  text?: string;
  context: string;       // Brief context of this connection
  type: ConnectionType;
  testament: "OT" | "NT";
}

export interface IntertestamentEntry {
  id: string;            // e.g., "isaiah-53" or "john-3-16"
  primaryReference: string;
  testament: "OT" | "NT";
  theme: string;
  description: string;
  oldTestament: TestamentConnection[];
  newTestament: TestamentConnection[];
}

// ─── Major Intertestament Connections ──────────────────────────

export const intertestamentConnections: IntertestamentEntry[] = [

  // ==================== CREATION & FALL ====================
  {
    id: "genesis-1",
    primaryReference: "Genesis 1:1",
    testament: "OT",
    theme: "Creation",
    description: "God as Creator — the foundation of all doctrine, echoed throughout the NT",
    oldTestament: [
      { reference: "Genesis 1:1", context: "God creates the heavens and the earth ex nihilo", type: "thematic", testament: "OT" },
      { reference: "Psalm 33:6", context: "By the word of the LORD the heavens were made", type: "thematic", testament: "OT" },
      { reference: "Isaiah 45:18", context: "God formed the earth to be inhabited", type: "thematic", testament: "OT" },
    ],
    newTestament: [
      { reference: "John 1:1-3", context: "All things were made through the Word — Christ as Creator", type: "thematic", testament: "NT" },
      { reference: "Colossians 1:16", context: "By Christ all things were created, visible and invisible", type: "thematic", testament: "NT" },
      { reference: "Hebrews 11:3", context: "By faith we understand the worlds were framed by God's word", type: "thematic", testament: "NT" },
      { reference: "Revelation 4:11", context: "You created all things, for Your pleasure they exist", type: "thematic", testament: "NT" },
    ]
  },
  {
    id: "genesis-3-15",
    primaryReference: "Genesis 3:15",
    testament: "OT",
    theme: "Protoevangelium — First Gospel Promise",
    description: "The first promise of a Redeemer — the seed of the woman crushing the serpent's head",
    oldTestament: [
      { reference: "Genesis 3:15", context: "The protoevangelium: enmity between the serpent and the woman's seed", type: "fulfillment", testament: "OT" },
      { reference: "Isaiah 7:14", context: "The virgin shall conceive and bear a son — Immanuel", type: "fulfillment", testament: "OT" },
    ],
    newTestament: [
      { reference: "Romans 16:20", context: "The God of peace shall bruise Satan under your feet shortly", type: "fulfillment", testament: "NT" },
      { reference: "Galatians 4:4", context: "When the fullness of time came, God sent forth His Son, made of a woman", type: "fulfillment", testament: "NT" },
      { reference: "Hebrews 2:14", context: "Christ took on flesh to destroy him who had the power of death — the devil", type: "fulfillment", testament: "NT" },
      { reference: "1 John 3:8", context: "The Son of God was manifested to destroy the works of the devil", type: "fulfillment", testament: "NT" },
      { reference: "Revelation 12:9", context: "The great dragon, that old serpent called the Devil, was cast out", type: "fulfillment", testament: "NT" },
    ]
  },

  // ==================== ABRAHAMIC COVENANT ====================
  {
    id: "genesis-12-3",
    primaryReference: "Genesis 12:3",
    testament: "OT",
    theme: "Abrahamic Covenant — Blessing to All Nations",
    description: "God's promise to bless all families of the earth through Abraham's seed — fulfilled in Christ",
    oldTestament: [
      { reference: "Genesis 12:3", context: "In you all families of the earth shall be blessed", type: "fulfillment", testament: "OT" },
      { reference: "Genesis 15:6", context: "Abraham believed God and it was counted to him for righteousness", type: "typology", testament: "OT" },
      { reference: "Genesis 22:18", context: "In your seed all nations shall be blessed — the promise confirmed at Moriah", type: "fulfillment", testament: "OT" },
    ],
    newTestament: [
      { reference: "Matthew 1:1", context: "Jesus Christ, the son of David, the son of Abraham", type: "fulfillment", testament: "NT" },
      { reference: "Acts 3:25", context: "You are children of the covenant God made with Abraham — in your seed all families blessed", type: "direct_quote", testament: "NT" },
      { reference: "Romans 4:3", context: "Abraham believed God and it was counted for righteousness — justification by faith", type: "direct_quote", testament: "NT" },
      { reference: "Galatians 3:8", context: "Scripture foresaw God would justify the heathen through faith — preached the gospel to Abraham", type: "direct_quote", testament: "NT" },
      { reference: "Galatians 3:16", context: "The promises were made to Abraham and to his seed — which is Christ", type: "fulfillment", testament: "NT" },
      { reference: "Hebrews 11:8-12", context: "By faith Abraham obeyed — looking for a city whose builder is God", type: "typology", testament: "NT" },
    ]
  },

  // ==================== EXODUS & PASSOVER ====================
  {
    id: "exodus-12",
    primaryReference: "Exodus 12:13",
    testament: "OT",
    theme: "Passover Lamb — Christ Our Passover",
    description: "The Passover lamb whose blood protected from judgment — the type fulfilled in Christ",
    oldTestament: [
      { reference: "Exodus 12:13", context: "When I see the blood, I will pass over you", type: "typology", testament: "OT" },
      { reference: "Exodus 12:46", context: "Neither shall you break a bone of it", type: "typology", testament: "OT" },
      { reference: "Isaiah 53:7", context: "He is brought as a lamb to the slaughter", type: "typology", testament: "OT" },
    ],
    newTestament: [
      { reference: "John 1:29", context: "Behold the Lamb of God who takes away the sin of the world", type: "typology", testament: "NT" },
      { reference: "John 19:36", context: "Not a bone of Him shall be broken — fulfillment of Exodus 12:46", type: "direct_quote", testament: "NT" },
      { reference: "1 Corinthians 5:7", context: "Christ our Passover is sacrificed for us", type: "typology", testament: "NT" },
      { reference: "1 Peter 1:19", context: "Redeemed with the precious blood of Christ, as of a lamb without blemish", type: "typology", testament: "NT" },
      { reference: "Revelation 5:12", context: "Worthy is the Lamb that was slain", type: "typology", testament: "NT" },
    ]
  },

  // ==================== MOSAIC LAW ====================
  {
    id: "exodus-20",
    primaryReference: "Exodus 20:1-17",
    testament: "OT",
    theme: "The Law — Its Purpose and Fulfillment",
    description: "God's moral law given at Sinai — kept perfectly by Christ, written on hearts in the New Covenant",
    oldTestament: [
      { reference: "Exodus 20:1-17", context: "The Ten Commandments — God's moral law", type: "thematic", testament: "OT" },
      { reference: "Deuteronomy 6:5", context: "You shall love the LORD your God with all your heart", type: "thematic", testament: "OT" },
      { reference: "Leviticus 19:18", context: "You shall love your neighbor as yourself", type: "thematic", testament: "OT" },
    ],
    newTestament: [
      { reference: "Matthew 5:17", context: "I came not to destroy the law but to fulfill", type: "fulfillment", testament: "NT" },
      { reference: "Matthew 22:37-40", context: "On these two commandments hang all the law and the prophets", type: "direct_quote", testament: "NT" },
      { reference: "Romans 3:20", context: "By the law is the knowledge of sin", type: "thematic", testament: "NT" },
      { reference: "Romans 7:7", context: "I had not known sin but by the law", type: "thematic", testament: "NT" },
      { reference: "Galatians 3:24", context: "The law was our schoolmaster to bring us to Christ", type: "thematic", testament: "NT" },
      { reference: "Hebrews 8:10", context: "I will put My laws in their mind and write them on their hearts", type: "fulfillment", testament: "NT" },
      { reference: "James 2:10", context: "Whoever keeps the whole law yet stumbles at one point is guilty of all", type: "thematic", testament: "NT" },
    ]
  },

  // ==================== DAVIDIC COVENANT ====================
  {
    id: "2-samuel-7",
    primaryReference: "2 Samuel 7:12-13",
    testament: "OT",
    theme: "Davidic Covenant — The Eternal Throne",
    description: "God's promise of an eternal throne to David's line — fulfilled in Christ the King",
    oldTestament: [
      { reference: "2 Samuel 7:12-13", context: "I will establish the throne of his kingdom forever", type: "fulfillment", testament: "OT" },
      { reference: "Psalm 89:3-4", context: "I have made a covenant with My chosen — your seed will I establish forever", type: "fulfillment", testament: "OT" },
      { reference: "Isaiah 9:7", context: "Of the increase of His government there shall be no end, upon the throne of David", type: "fulfillment", testament: "OT" },
      { reference: "Jeremiah 33:17", context: "David shall never lack a man to sit upon the throne", type: "fulfillment", testament: "OT" },
    ],
    newTestament: [
      { reference: "Matthew 1:1", context: "The book of the generation of Jesus Christ, the son of David", type: "fulfillment", testament: "NT" },
      { reference: "Luke 1:32-33", context: "The Lord God shall give Him the throne of His father David — He shall reign forever", type: "fulfillment", testament: "NT" },
      { reference: "Acts 2:30", context: "David being a prophet knew God had sworn an oath — Christ would sit on his throne", type: "fulfillment", testament: "NT" },
      { reference: "Romans 1:3", context: "Jesus Christ our Lord, made of the seed of David according to the flesh", type: "fulfillment", testament: "NT" },
      { reference: "Revelation 22:16", context: "I am the root and offspring of David, the bright and morning star", type: "fulfillment", testament: "NT" },
    ]
  },

  // ==================== PSALMS ====================
  {
    id: "psalm-22",
    primaryReference: "Psalm 22:1",
    testament: "OT",
    theme: "The Suffering Messiah — Psalm 22",
    description: "David's prophetic psalm of crucifixion — fulfilled in precise detail at Calvary",
    oldTestament: [
      { reference: "Psalm 22:1", context: "My God, my God, why have You forsaken Me?", type: "fulfillment", testament: "OT" },
      { reference: "Psalm 22:7-8", context: "All who see Me mock Me — He trusted in the LORD, let Him deliver Him", type: "fulfillment", testament: "OT" },
      { reference: "Psalm 22:16", context: "They pierced My hands and My feet", type: "fulfillment", testament: "OT" },
      { reference: "Psalm 22:18", context: "They part My garments among them and cast lots for My vesture", type: "fulfillment", testament: "OT" },
    ],
    newTestament: [
      { reference: "Matthew 27:35", context: "They crucified Him and parted His garments, casting lots — Psalm 22:18 fulfilled", type: "direct_quote", testament: "NT" },
      { reference: "Matthew 27:39-43", context: "Those who passed by reviled Him — 'He trusted in God, let Him deliver Him' — Psalm 22:7-8", type: "direct_quote", testament: "NT" },
      { reference: "Matthew 27:46", context: "My God, My God, why have You forsaken Me? — Christ quotes Psalm 22:1 from the cross", type: "direct_quote", testament: "NT" },
      { reference: "John 19:24", context: "They said, Let us not rend it but cast lots — that Scripture might be fulfilled (Psalm 22:18)", type: "direct_quote", testament: "NT" },
      { reference: "John 20:25", context: "Except I see the print of the nails — pierced hands and feet (Psalm 22:16)", type: "fulfillment", testament: "NT" },
      { reference: "Hebrews 2:12", context: "I will declare Your name to My brethren — Psalm 22:22 applied to Christ", type: "direct_quote", testament: "NT" },
    ]
  },
  {
    id: "psalm-110",
    primaryReference: "Psalm 110:1",
    testament: "OT",
    theme: "The Priestly King — Psalm 110",
    description: "The most quoted OT psalm in the NT — Christ as both David's Lord and eternal Priest",
    oldTestament: [
      { reference: "Psalm 110:1", context: "The LORD said to my Lord, Sit at My right hand until I make Your enemies Your footstool", type: "fulfillment", testament: "OT" },
      { reference: "Psalm 110:4", context: "You are a priest forever after the order of Melchizedek", type: "fulfillment", testament: "OT" },
    ],
    newTestament: [
      { reference: "Matthew 22:44", context: "Jesus asks: How does David call Him Lord? — quoting Psalm 110:1", type: "direct_quote", testament: "NT" },
      { reference: "Mark 16:19", context: "He was received up into heaven and sat at the right hand of God", type: "fulfillment", testament: "NT" },
      { reference: "Acts 2:34-35", context: "Peter preaches: David is not ascended but said, The LORD said to my Lord, Sit at My right hand", type: "direct_quote", testament: "NT" },
      { reference: "Hebrews 5:6", context: "You are a priest forever after the order of Melchizedek — applied to Christ", type: "direct_quote", testament: "NT" },
      { reference: "Hebrews 7:17", context: "Christ's priesthood is eternal, after Melchizedek's order — greater than Levi", type: "direct_quote", testament: "NT" },
      { reference: "Hebrews 10:12-13", context: "This Man sat down at the right hand of God, waiting until His enemies are made His footstool", type: "fulfillment", testament: "NT" },
    ]
  },

  // ==================== ISAIAH ====================
  {
    id: "isaiah-7-14",
    primaryReference: "Isaiah 7:14",
    testament: "OT",
    theme: "The Virgin Birth",
    description: "The sign of Immanuel — God with us, born of a virgin",
    oldTestament: [
      { reference: "Isaiah 7:14", context: "Behold, a virgin shall conceive and bear a Son, and shall call His name Immanuel", type: "fulfillment", testament: "OT" },
    ],
    newTestament: [
      { reference: "Matthew 1:23", context: "All this was done that it might be fulfilled — they shall call His name Immanuel, God with us", type: "direct_quote", testament: "NT" },
      { reference: "Luke 1:31", context: "You shall conceive and bring forth a Son and call His name JESUS", type: "fulfillment", testament: "NT" },
    ]
  },
  {
    id: "isaiah-53",
    primaryReference: "Isaiah 53:5",
    testament: "OT",
    theme: "The Suffering Servant",
    description: "Isaiah's vision of the atoning death of Christ — the most detailed prophecy of the cross",
    oldTestament: [
      { reference: "Isaiah 52:14", context: "His visage was marred more than any man", type: "fulfillment", testament: "OT" },
      { reference: "Isaiah 53:3", context: "He is despised and rejected of men, a man of sorrows", type: "fulfillment", testament: "OT" },
      { reference: "Isaiah 53:5", context: "He was wounded for our transgressions, bruised for our iniquities", type: "fulfillment", testament: "OT" },
      { reference: "Isaiah 53:7", context: "He opened not His mouth — as a lamb to the slaughter", type: "fulfillment", testament: "OT" },
      { reference: "Isaiah 53:9", context: "He made His grave with the wicked and with the rich in His death", type: "fulfillment", testament: "OT" },
      { reference: "Isaiah 53:11-12", context: "By His knowledge shall My righteous Servant justify many — He bore the sin of many", type: "fulfillment", testament: "OT" },
    ],
    newTestament: [
      { reference: "Matthew 8:17", context: "He took our infirmities and bore our sicknesses — Isaiah 53:4 quoted", type: "direct_quote", testament: "NT" },
      { reference: "Matthew 27:57-60", context: "Joseph of Arimathea, a rich man, took the body — Isaiah 53:9 fulfilled", type: "fulfillment", testament: "NT" },
      { reference: "Mark 15:28", context: "He was numbered with the transgressors — Isaiah 53:12", type: "direct_quote", testament: "NT" },
      { reference: "John 12:38", context: "Who has believed our report? — Isaiah 53:1 quoted", type: "direct_quote", testament: "NT" },
      { reference: "Acts 8:32-35", context: "Philip preaches Christ from Isaiah 53 to the Ethiopian eunuch", type: "direct_quote", testament: "NT" },
      { reference: "Romans 10:16", context: "Lord, who has believed our report? — Isaiah 53:1", type: "direct_quote", testament: "NT" },
      { reference: "1 Peter 2:24-25", context: "By His stripes you were healed — you were as sheep going astray — Isaiah 53:5-6", type: "direct_quote", testament: "NT" },
    ]
  },

  // ==================== NEW COVENANT ====================
  {
    id: "jeremiah-31",
    primaryReference: "Jeremiah 31:31-34",
    testament: "OT",
    theme: "The New Covenant",
    description: "God's promise of a new covenant — the law written on hearts, sins remembered no more",
    oldTestament: [
      { reference: "Jeremiah 31:31-34", context: "I will make a new covenant — I will put My law in their inward parts and write it in their hearts", type: "fulfillment", testament: "OT" },
      { reference: "Ezekiel 36:26-27", context: "A new heart will I give you — I will put My Spirit within you", type: "fulfillment", testament: "OT" },
    ],
    newTestament: [
      { reference: "Matthew 26:28", context: "This is My blood of the new testament, shed for many for the remission of sins", type: "fulfillment", testament: "NT" },
      { reference: "Luke 22:20", context: "This cup is the new testament in My blood, which is shed for you", type: "fulfillment", testament: "NT" },
      { reference: "Hebrews 8:8-12", context: "The longest OT quotation in the NT — Jeremiah 31:31-34 quoted in full", type: "direct_quote", testament: "NT" },
      { reference: "Hebrews 10:16-17", context: "This is the covenant I will make with them — their sins I will remember no more", type: "direct_quote", testament: "NT" },
    ]
  },

  // ==================== GOSPELS ====================
  {
    id: "matthew-5",
    primaryReference: "Matthew 5:17",
    testament: "NT",
    theme: "Christ Fulfills the Law and Prophets",
    description: "Jesus' relationship to the Old Testament — not abolition but fulfillment",
    oldTestament: [
      { reference: "Isaiah 42:21", context: "The LORD is well pleased for His righteousness' sake — He will magnify the law", type: "fulfillment", testament: "OT" },
      { reference: "Jeremiah 31:33", context: "I will put My law in their inward parts", type: "fulfillment", testament: "OT" },
    ],
    newTestament: [
      { reference: "Matthew 5:17", context: "Think not I am come to destroy the law or the prophets — I am come to fulfill", type: "fulfillment", testament: "NT" },
      { reference: "Matthew 5:21-48", context: "You have heard... but I say unto you — Christ's authoritative exposition of the law", type: "thematic", testament: "NT" },
      { reference: "Romans 10:4", context: "Christ is the end of the law for righteousness to everyone who believes", type: "thematic", testament: "NT" },
      { reference: "Galatians 3:13", context: "Christ has redeemed us from the curse of the law", type: "thematic", testament: "NT" },
    ]
  },
  {
    id: "john-1",
    primaryReference: "John 1:1",
    testament: "NT",
    theme: "The Word Became Flesh",
    description: "The eternal Logos — with God in the beginning, now tabernacling among us",
    oldTestament: [
      { reference: "Genesis 1:1", context: "In the beginning God created — John 1:1 echoes the very first words of Scripture", type: "allusion", testament: "OT" },
      { reference: "Exodus 33:18", context: "Show me Your glory — Moses' request fulfilled in Christ", type: "typology", testament: "OT" },
      { reference: "Exodus 40:34", context: "The glory of the LORD filled the tabernacle — Christ tabernacled among us", type: "typology", testament: "OT" },
    ],
    newTestament: [
      { reference: "John 1:1", context: "In the beginning was the Word, and the Word was with God, and the Word was God", type: "thematic", testament: "NT" },
      { reference: "John 1:14", context: "The Word was made flesh and dwelt (tabernacled) among us", type: "fulfillment", testament: "NT" },
      { reference: "John 1:17", context: "The law was given by Moses, but grace and truth came by Jesus Christ", type: "thematic", testament: "NT" },
      { reference: "Colossians 2:9", context: "In Him dwells all the fullness of the Godhead bodily", type: "thematic", testament: "NT" },
    ]
  },
  {
    id: "john-3",
    primaryReference: "John 3:14-16",
    testament: "NT",
    theme: "The Serpent Lifted Up — Faith Looks and Lives",
    description: "Christ appeals to Numbers 21 to explain His crucifixion — as Moses lifted up the serpent, so must the Son be lifted up",
    oldTestament: [
      { reference: "Numbers 21:8-9", context: "Moses made a serpent of brass — whoever looked upon it lived", type: "typology", testament: "OT" },
    ],
    newTestament: [
      { reference: "John 3:14-15", context: "As Moses lifted up the serpent, even so must the Son of man be lifted up", type: "typology", testament: "NT" },
      { reference: "John 3:16", context: "For God so loved the world that He gave His only begotten Son", type: "thematic", testament: "NT" },
      { reference: "John 12:32", context: "And I, if I be lifted up from the earth, will draw all men unto Me", type: "typology", testament: "NT" },
    ]
  },

  // ==================== ROMANS ====================
  {
    id: "romans-3-4",
    primaryReference: "Romans 3:23-24",
    testament: "NT",
    theme: "Justification by Faith — The Righteousness of God",
    description: "Paul's masterwork on justification — how OT saints were saved the same way we are: by faith",
    oldTestament: [
      { reference: "Genesis 15:6", context: "Abraham believed God and it was counted for righteousness", type: "direct_quote", testament: "OT" },
      { reference: "Psalm 32:1-2", context: "Blessed is he whose transgression is forgiven — David on imputed righteousness", type: "direct_quote", testament: "OT" },
      { reference: "Habakkuk 2:4", context: "The just shall live by his faith", type: "direct_quote", testament: "OT" },
    ],
    newTestament: [
      { reference: "Romans 1:17", context: "The righteousness of God is revealed from faith to faith — the just shall live by faith (Hab 2:4)", type: "direct_quote", testament: "NT" },
      { reference: "Romans 3:21-26", context: "The righteousness of God through faith in Jesus Christ — propitiation by His blood", type: "thematic", testament: "NT" },
      { reference: "Romans 4:3-8", context: "Abraham believed God — David describes blessedness of imputed righteousness (Gen 15:6, Psalm 32)", type: "direct_quote", testament: "NT" },
      { reference: "Romans 5:1", context: "Therefore being justified by faith, we have peace with God", type: "thematic", testament: "NT" },
      { reference: "Galatians 3:11", context: "No man is justified by the law — the just shall live by faith (Hab 2:4)", type: "direct_quote", testament: "NT" },
    ]
  },
  {
    id: "romans-5",
    primaryReference: "Romans 5:12-21",
    testament: "NT",
    theme: "Adam and Christ — The Two Federal Heads",
    description: "Paul's great parallel between Adam's disobedience and Christ's obedience",
    oldTestament: [
      { reference: "Genesis 3:6", context: "Adam's disobedience — by one man sin entered the world", type: "typology", testament: "OT" },
    ],
    newTestament: [
      { reference: "Romans 5:12", context: "By one man sin entered the world, and death by sin", type: "typology", testament: "NT" },
      { reference: "Romans 5:14", context: "Adam is a figure (type) of Him who was to come", type: "typology", testament: "NT" },
      { reference: "Romans 5:18-19", context: "By one man's disobedience many were made sinners — by one Man's obedience many made righteous", type: "typology", testament: "NT" },
      { reference: "1 Corinthians 15:22", context: "As in Adam all die, even so in Christ shall all be made alive", type: "typology", testament: "NT" },
      { reference: "1 Corinthians 15:45", context: "The first Adam was made a living soul; the last Adam a quickening spirit", type: "typology", testament: "NT" },
    ]
  },
  {
    id: "romans-8",
    primaryReference: "Romans 8:28-30",
    testament: "NT",
    theme: "The Golden Chain of Salvation",
    description: "Foreknowledge → Predestination → Calling → Justification → Glorification — the unbreakable chain",
    oldTestament: [
      { reference: "Isaiah 46:10", context: "Declaring the end from the beginning — God's sovereign decree", type: "thematic", testament: "OT" },
      { reference: "Jeremiah 1:5", context: "Before I formed you in the belly I knew you — divine foreknowledge", type: "thematic", testament: "OT" },
    ],
    newTestament: [
      { reference: "Romans 8:28", context: "All things work together for good to those who love God, the called according to His purpose", type: "thematic", testament: "NT" },
      { reference: "Romans 8:29-30", context: "Foreknown → predestinated → called → justified → glorified — the golden chain", type: "thematic", testament: "NT" },
      { reference: "Ephesians 1:4-5", context: "Chosen in Him before the foundation of the world — predestinated to adoption", type: "thematic", testament: "NT" },
      { reference: "Ephesians 1:11", context: "Predestinated according to the purpose of Him who works all things", type: "thematic", testament: "NT" },
    ]
  },

  // ==================== HEBREWS ====================
  {
    id: "hebrews-11",
    primaryReference: "Hebrews 11:1",
    testament: "NT",
    theme: "The Hall of Faith — OT Saints Who Lived by Faith",
    description: "The great faith chapter — proving that OT saints were saved by faith, not works",
    oldTestament: [
      { reference: "Genesis 4:4", context: "Abel offered a more excellent sacrifice — faith's first witness", type: "typology", testament: "OT" },
      { reference: "Genesis 5:24", context: "Enoch walked with God and was not — faith's translation", type: "typology", testament: "OT" },
      { reference: "Genesis 6:22", context: "Noah moved with fear prepared an ark — faith's obedience", type: "typology", testament: "OT" },
      { reference: "Genesis 12:1-4", context: "Abraham went out, not knowing where he went — faith's pilgrimage", type: "typology", testament: "OT" },
      { reference: "Genesis 22:10", context: "Abraham offered up Isaac — faith's supreme test", type: "typology", testament: "OT" },
      { reference: "Exodus 2:3", context: "Moses was hid by faith — faith's deliverance", type: "typology", testament: "OT" },
    ],
    newTestament: [
      { reference: "Hebrews 11:1", context: "Faith is the substance of things hoped for, the evidence of things not seen", type: "thematic", testament: "NT" },
      { reference: "Hebrews 11:6", context: "Without faith it is impossible to please God", type: "thematic", testament: "NT" },
      { reference: "Hebrews 11:13", context: "These all died in faith, not having received the promises but seeing them afar off", type: "thematic", testament: "NT" },
      { reference: "Hebrews 12:1-2", context: "Surrounded by so great a cloud of witnesses, looking unto Jesus, author and finisher of faith", type: "thematic", testament: "NT" },
    ]
  },
  {
    id: "hebrews-7",
    primaryReference: "Hebrews 7:1-3",
    testament: "NT",
    theme: "Melchizedek — The Priest-King Type of Christ",
    description: "The mysterious priest-king of Genesis 14 as a type of Christ's eternal priesthood",
    oldTestament: [
      { reference: "Genesis 14:18-20", context: "Melchizedek king of Salem brought forth bread and wine — priest of the Most High God", type: "typology", testament: "OT" },
      { reference: "Psalm 110:4", context: "You are a priest forever after the order of Melchizedek", type: "typology", testament: "OT" },
    ],
    newTestament: [
      { reference: "Hebrews 5:6", context: "Christ called a high priest after the order of Melchizedek", type: "typology", testament: "NT" },
      { reference: "Hebrews 7:1-3", context: "Melchizedek — without father, without mother, without descent — made like the Son of God", type: "typology", testament: "NT" },
      { reference: "Hebrews 7:11", context: "If perfection were by the Levitical priesthood, why was another priest needed after Melchizedek's order?", type: "typology", testament: "NT" },
      { reference: "Hebrews 7:24-25", context: "Christ's priesthood is unchangeable — He ever lives to make intercession", type: "typology", testament: "NT" },
    ]
  },

  // ==================== REVELATION ====================
  {
    id: "revelation-21",
    primaryReference: "Revelation 21:1-4",
    testament: "NT",
    theme: "The New Creation — All Things Made New",
    description: "The final vision — new heaven, new earth, new Jerusalem — echoes Genesis and Isaiah",
    oldTestament: [
      { reference: "Genesis 1:1", context: "In the beginning God created the heavens and the earth — creation's beginning", type: "allusion", testament: "OT" },
      { reference: "Genesis 2:10", context: "A river went out of Eden — the river of life in Revelation 22 echoes Eden", type: "typology", testament: "OT" },
      { reference: "Isaiah 65:17", context: "Behold, I create new heavens and a new earth — Revelation 21:1's direct antecedent", type: "direct_quote", testament: "OT" },
      { reference: "Isaiah 60:19", context: "The LORD shall be your everlasting light — no need of sun or moon", type: "allusion", testament: "OT" },
      { reference: "Ezekiel 47:12", context: "The tree of life with leaves for healing — Revelation 22:2", type: "typology", testament: "OT" },
    ],
    newTestament: [
      { reference: "Revelation 21:1", context: "I saw a new heaven and a new earth — the first heaven and earth passed away", type: "direct_quote", testament: "NT" },
      { reference: "Revelation 21:4", context: "God shall wipe away all tears — no more death, sorrow, crying, pain", type: "thematic", testament: "NT" },
      { reference: "Revelation 22:1-2", context: "The river of water of life and the tree of life — Eden restored and transcended", type: "typology", testament: "NT" },
      { reference: "2 Peter 3:13", context: "We look for new heavens and a new earth wherein dwells righteousness", type: "thematic", testament: "NT" },
    ]
  },

  // ==================== MAJOR THEMES ====================
  {
    id: "faith-hope-love",
    primaryReference: "1 Corinthians 13:13",
    testament: "NT",
    theme: "Faith, Hope, Love — 1 Corinthians 13 Across the Testaments",
    description: "The three abiding virtues traced from OT foundation to NT fulfillment",
    oldTestament: [
      { reference: "Genesis 15:6", context: "Abraham believed God — faith's foundation", type: "thematic", testament: "OT" },
      { reference: "Psalm 33:18-22", context: "Our soul waits for the LORD — hope in His mercy", type: "thematic", testament: "OT" },
      { reference: "Deuteronomy 6:5", context: "You shall love the LORD your God with all your heart", type: "thematic", testament: "OT" },
      { reference: "Jeremiah 17:7", context: "Blessed is the man who trusts in the LORD — faith and hope united", type: "thematic", testament: "OT" },
      { reference: "Lamentations 3:22-24", context: "His compassions fail not — great is Your faithfulness — the LORD is my portion, therefore I hope", type: "thematic", testament: "OT" },
    ],
    newTestament: [
      { reference: "1 Corinthians 13:13", context: "Now abides faith, hope, love, these three — but the greatest is love", type: "thematic", testament: "NT" },
      { reference: "Romans 5:1-5", context: "Justified by faith → peace → hope of glory → tribulation produces hope → love of God shed abroad", type: "thematic", testament: "NT" },
      { reference: "Galatians 5:5-6", context: "We through the Spirit wait for the hope of righteousness by faith — faith working by love", type: "thematic", testament: "NT" },
      { reference: "Colossians 1:4-5", context: "Your faith in Christ, love to saints, for the hope laid up in heaven", type: "thematic", testament: "NT" },
      { reference: "1 Thessalonians 1:3", context: "Your work of faith, labor of love, patience of hope — Paul's triad", type: "thematic", testament: "NT" },
      { reference: "1 Thessalonians 5:8", context: "The breastplate of faith and love, the helmet — the hope of salvation", type: "thematic", testament: "NT" },
      { reference: "Hebrews 10:22-24", context: "Full assurance of faith → hold fast the profession of hope → provoke unto love", type: "thematic", testament: "NT" },
      { reference: "1 Peter 1:21-22", context: "Faith and hope in God → love one another with a pure heart", type: "thematic", testament: "NT" },
    ]
  },
  {
    id: "shepherd-theme",
    primaryReference: "Psalm 23:1",
    testament: "OT",
    theme: "The Shepherd — From David to the Good Shepherd",
    description: "The LORD as Shepherd in the OT, incarnate in Jesus Christ in the NT",
    oldTestament: [
      { reference: "Psalm 23:1", context: "The LORD is my Shepherd, I shall not want", type: "typology", testament: "OT" },
      { reference: "Isaiah 40:11", context: "He shall feed His flock like a shepherd — gather the lambs in His arms", type: "typology", testament: "OT" },
      { reference: "Ezekiel 34:23", context: "I will set up one Shepherd over them — My servant David", type: "fulfillment", testament: "OT" },
    ],
    newTestament: [
      { reference: "John 10:11", context: "I am the Good Shepherd — the Good Shepherd gives His life for the sheep", type: "fulfillment", testament: "NT" },
      { reference: "John 10:14-16", context: "I know My sheep — other sheep I have — one fold, one Shepherd", type: "fulfillment", testament: "NT" },
      { reference: "Hebrews 13:20", context: "The God of peace brought again from the dead our Lord Jesus, that great Shepherd of the sheep", type: "fulfillment", testament: "NT" },
      { reference: "1 Peter 2:25", context: "You were as sheep going astray but are now returned to the Shepherd of your souls", type: "fulfillment", testament: "NT" },
      { reference: "1 Peter 5:4", context: "When the Chief Shepherd shall appear, you shall receive a crown of glory", type: "fulfillment", testament: "NT" },
      { reference: "Revelation 7:17", context: "The Lamb shall feed them and lead them to living fountains of waters", type: "fulfillment", testament: "NT" },
    ]
  },
  {
    id: "temple-theme",
    primaryReference: "Exodus 25:8",
    testament: "OT",
    theme: "The Temple — From Tabernacle to Living Stones",
    description: "God dwelling with His people — from tent to temple to Christ's body to the Church to the New Jerusalem",
    oldTestament: [
      { reference: "Exodus 25:8", context: "Let them make Me a sanctuary that I may dwell among them", type: "typology", testament: "OT" },
      { reference: "1 Kings 8:27", context: "Will God indeed dwell on earth? The heaven of heavens cannot contain You", type: "thematic", testament: "OT" },
      { reference: "Isaiah 66:1", context: "Heaven is My throne, earth is My footstool — where is the house you will build?", type: "thematic", testament: "OT" },
    ],
    newTestament: [
      { reference: "John 1:14", context: "The Word was made flesh and dwelt (tabernacled) among us", type: "typology", testament: "NT" },
      { reference: "John 2:19-21", context: "Destroy this temple and in three days I will raise it up — He spoke of His body", type: "typology", testament: "NT" },
      { reference: "1 Corinthians 3:16", context: "You are the temple of God — the Spirit of God dwells in you", type: "typology", testament: "NT" },
      { reference: "1 Corinthians 6:19", context: "Your body is the temple of the Holy Ghost", type: "typology", testament: "NT" },
      { reference: "Ephesians 2:21-22", context: "The whole building grows into a holy temple in the Lord — a habitation of God through the Spirit", type: "typology", testament: "NT" },
      { reference: "1 Peter 2:5", context: "You as living stones are built up a spiritual house", type: "typology", testament: "NT" },
      { reference: "Revelation 21:22", context: "I saw no temple therein — the Lord God Almighty and the Lamb are the temple", type: "fulfillment", testament: "NT" },
    ]
  }
];

// ─── Lookup Utilities ───────────────────────────────────────────

/** Map keyed by reference for O(1) exact-match lookup */
const referenceMap = new Map<string, IntertestamentEntry[]>();
for (const entry of intertestamentConnections) {
  // Index by primary reference
  const key = normalizeRef(entry.primaryReference);
  if (!referenceMap.has(key)) referenceMap.set(key, []);
  referenceMap.get(key)!.push(entry);

  // Index by all OT refs
  for (const conn of entry.oldTestament) {
    const rk = normalizeRef(conn.reference);
    if (rk !== key) {
      if (!referenceMap.has(rk)) referenceMap.set(rk, []);
      referenceMap.get(rk)!.push(entry);
    }
  }

  // Index by all NT refs
  for (const conn of entry.newTestament) {
    const rk = normalizeRef(conn.reference);
    if (rk !== key) {
      if (!referenceMap.has(rk)) referenceMap.set(rk, []);
      referenceMap.get(rk)!.push(entry);
    }
  }
}

function normalizeRef(ref: string): string {
  return ref.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Find intertestament connections for a given verse reference.
 * Matches exact reference and also book-level/chapter-level matches.
 */
export function findIntertestamentConnections(ref: string): IntertestamentEntry[] {
  const normalized = normalizeRef(ref);
  
  // Exact match
  if (referenceMap.has(normalized)) {
    return referenceMap.get(normalized)!;
  }

  // Partial match — check if ref is contained in any key or vice versa
  const results: IntertestamentEntry[] = [];
  for (const [key, entries] of referenceMap) {
    if (key.includes(normalized) || normalized.includes(key)) {
      results.push(...entries);
    }
  }

  // Deduplicate
  return [...new Map(results.map(e => [e.id, e])).values()];
}

/**
 * Get all intertestament connections
 */
export function getAllConnections(): IntertestamentEntry[] {
  return intertestamentConnections;
}

/**
 * Search by theme or description
 */
export function searchConnections(query: string): IntertestamentEntry[] {
  const q = query.toLowerCase();
  return intertestamentConnections.filter(e =>
    e.theme.toLowerCase().includes(q) ||
    e.description.toLowerCase().includes(q) ||
    e.primaryReference.toLowerCase().includes(q) ||
    e.oldTestament.some(c => c.reference.toLowerCase().includes(q) || c.context.toLowerCase().includes(q)) ||
    e.newTestament.some(c => c.reference.toLowerCase().includes(q) || c.context.toLowerCase().includes(q))
  );
}
