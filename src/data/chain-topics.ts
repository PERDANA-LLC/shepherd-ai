/**
 * Thompson Chain Reference — Curated Topic Index
 * 
 * Each topic has:
 * - id: chain number (like Thompson's numbered chains)
 * - name: topic name
 * - category: broad grouping
 * - verses: ordered chain of KJV verse references
 * - description: what the chain traces
 */

export interface ChainTopic {
  id: number;
  name: string;
  category: string;
  description: string;
  verses: string[];  // ordered chain of KJV references
}

export interface ChainCategory {
  name: string;
  topics: number[];  // chain IDs in this category
}

export const chainTopics: ChainTopic[] = [
  // ============================================================
  // GOD — Attributes, Names, Works
  // ============================================================
  {
    id: 1001,
    name: "God's Love",
    category: "God",
    description: "The love of God for His people, from covenant to consummation",
    verses: [
      "Deuteronomy 7:7-8", "Psalm 36:7", "Psalm 63:3", "Psalm 86:15",
      "Jeremiah 31:3", "John 3:16", "John 15:9", "John 17:23",
      "Romans 5:8", "Romans 8:35-39", "Ephesians 2:4-5", "1 John 3:1",
      "1 John 4:9-10", "1 John 4:16", "1 John 4:19"
    ]
  },
  {
    id: 1002,
    name: "God's Holiness",
    category: "God",
    description: "The transcendent purity and separateness of God",
    verses: [
      "Exodus 15:11", "Leviticus 11:44", "Joshua 24:19", "1 Samuel 2:2",
      "Psalm 99:3", "Psalm 99:5", "Psalm 99:9", "Isaiah 6:3",
      "Isaiah 57:15", "Habakkuk 1:13", "Revelation 4:8", "Revelation 15:4"
    ]
  },
  {
    id: 1003,
    name: "God's Faithfulness",
    category: "God",
    description: "God's covenant faithfulness and unchanging reliability",
    verses: [
      "Deuteronomy 7:9", "Psalm 36:5", "Psalm 89:1-2", "Psalm 89:33",
      "Psalm 119:90", "Lamentations 3:22-23", "1 Corinthians 1:9",
      "1 Corinthians 10:13", "2 Thessalonians 3:3", "2 Timothy 2:13",
      "Hebrews 10:23", "1 Peter 4:19", "1 John 1:9"
    ]
  },
  {
    id: 1004,
    name: "God's Sovereignty",
    category: "God",
    description: "God's absolute rule over creation, history, and salvation",
    verses: [
      "1 Chronicles 29:11-12", "Job 42:2", "Psalm 103:19", "Psalm 115:3",
      "Psalm 135:6", "Proverbs 16:33", "Proverbs 21:1", "Isaiah 14:24",
      "Isaiah 46:9-10", "Daniel 4:35", "Matthew 10:29", "Acts 17:24-26",
      "Romans 8:28", "Ephesians 1:11", "Colossians 1:16-17"
    ]
  },
  {
    id: 1005,
    name: "The Trinity",
    category: "God",
    description: "One God in three Persons — Father, Son, and Holy Spirit",
    verses: [
      "Matthew 3:16-17", "Matthew 28:19", "John 1:1", "John 10:30",
      "John 14:16-17", "John 14:26", "John 15:26", "Acts 5:3-4",
      "Romans 8:9-11", "1 Corinthians 12:4-6", "2 Corinthians 13:14",
      "Ephesians 4:4-6", "Hebrews 9:14", "1 Peter 1:2", "1 John 5:7"
    ]
  },

  // ============================================================
  // JESUS CHRIST — Person, Work, Names
  // ============================================================
  {
    id: 2001,
    name: "Messianic Prophecies",
    category: "Jesus Christ",
    description: "Old Testament prophecies fulfilled in Jesus Christ",
    verses: [
      "Genesis 3:15", "Genesis 12:3", "Genesis 49:10", "Deuteronomy 18:15",
      "2 Samuel 7:12-13", "Psalm 2:7", "Psalm 22:1", "Psalm 22:16",
      "Psalm 22:18", "Psalm 110:1", "Isaiah 7:14", "Isaiah 9:6-7",
      "Isaiah 53:3", "Isaiah 53:5", "Isaiah 53:7", "Jeremiah 23:5",
      "Micah 5:2", "Zechariah 9:9", "Zechariah 12:10", "Malachi 3:1"
    ]
  },
  {
    id: 2002,
    name: "Names of Christ",
    category: "Jesus Christ",
    description: "The titles and names revealing Christ's person and work",
    verses: [
      "Genesis 3:15", "Isaiah 7:14", "Isaiah 9:6", "Matthew 1:21",
      "Matthew 1:23", "John 1:1", "John 1:29", "John 6:35",
      "John 8:12", "John 10:11", "John 11:25", "John 14:6",
      "John 15:1", "1 Corinthians 3:11", "1 Timothy 2:5",
      "Hebrews 12:2", "Revelation 1:8", "Revelation 5:5", "Revelation 22:16"
    ]
  },
  {
    id: 2003,
    name: "The Cross",
    category: "Jesus Christ",
    description: "Christ's atoning death — substitution, propitiation, redemption",
    verses: [
      "Isaiah 53:5-6", "Isaiah 53:10-11", "Matthew 20:28", "Mark 10:45",
      "John 10:11", "John 10:15", "John 10:17-18", "Romans 3:25",
      "Romans 5:6", "Romans 5:8", "1 Corinthians 15:3", "2 Corinthians 5:21",
      "Galatians 3:13", "Ephesians 1:7", "Colossians 1:20", "Colossians 2:14",
      "1 Timothy 2:6", "Hebrews 9:12", "Hebrews 9:26", "Hebrews 10:10",
      "Hebrews 10:12", "Hebrews 10:14", "1 Peter 2:24", "1 Peter 3:18",
      "1 John 2:2", "1 John 4:10", "Revelation 5:9"
    ]
  },
  {
    id: 2004,
    name: "Resurrection of Christ",
    category: "Jesus Christ",
    description: "Christ's victory over death — historical fact and theological center",
    verses: [
      "Psalm 16:10", "Matthew 12:40", "Matthew 16:21", "Matthew 28:5-6",
      "Mark 16:6", "Luke 24:6-7", "Luke 24:46", "John 2:19",
      "John 10:18", "John 11:25", "Acts 2:24", "Acts 2:32",
      "Acts 3:15", "Acts 4:33", "Romans 1:4", "Romans 4:25",
      "Romans 6:4", "Romans 6:9", "1 Corinthians 15:4", "1 Corinthians 15:14",
      "1 Corinthians 15:17", "1 Corinthians 15:20", "Philippians 3:10",
      "1 Peter 1:3", "Revelation 1:18"
    ]
  },
  {
    id: 2005,
    name: "Second Coming",
    category: "Jesus Christ",
    description: "The return of Christ — judgment, restoration, and hope",
    verses: [
      "Matthew 24:30", "Matthew 24:44", "Matthew 25:31", "Mark 13:26",
      "Luke 21:27", "John 14:3", "Acts 1:11", "1 Corinthians 15:23",
      "Philippians 3:20", "1 Thessalonians 4:16-17", "2 Thessalonians 1:7-8",
      "2 Thessalonians 2:8", "1 Timothy 6:14", "Titus 2:13",
      "Hebrews 9:28", "James 5:7-8", "2 Peter 3:10", "1 John 2:28",
      "Jude 1:14", "Revelation 1:7", "Revelation 19:11", "Revelation 22:20"
    ]
  },

  // ============================================================
  // HOLY SPIRIT
  // ============================================================
  {
    id: 3001,
    name: "The Holy Spirit — Person & Work",
    category: "Holy Spirit",
    description: "The third Person of the Trinity — His deity, personality, and ministry",
    verses: [
      "John 14:16-17", "John 14:26", "John 15:26", "John 16:7-8",
      "John 16:13-14", "Acts 1:8", "Acts 2:4", "Acts 5:3-4",
      "Romans 8:9", "Romans 8:14", "Romans 8:16", "Romans 8:26-27",
      "1 Corinthians 2:10-11", "1 Corinthians 6:19", "1 Corinthians 12:11",
      "Galatians 5:22-23", "Ephesians 1:13-14", "Ephesians 4:30",
      "Hebrews 9:14", "2 Peter 1:21"
    ]
  },
  {
    id: 3002,
    name: "Fruit of the Spirit",
    category: "Holy Spirit",
    description: "The nine-fold fruit from Galatians 5 plus James 3 wisdom fruit",
    verses: [
      "Psalm 1:3", "Matthew 7:17-18", "Matthew 7:20", "John 15:2",
      "John 15:4-5", "John 15:8", "Romans 6:22", "Romans 7:4",
      "Galatians 5:22-23", "Ephesians 5:9", "Philippians 1:11",
      "Colossians 1:10", "Hebrews 12:11", "James 3:17-18"
    ]
  },
  {
    id: 3003,
    name: "Spiritual Gifts",
    category: "Holy Spirit",
    description: "Gifts given by the Spirit for the building up of the body",
    verses: [
      "Romans 12:6-8", "1 Corinthians 12:4-11", "1 Corinthians 12:28-31",
      "1 Corinthians 14:1", "Ephesians 4:7-8", "Ephesians 4:11-13",
      "1 Peter 4:10-11"
    ]
  },

  // ============================================================
  // SALVATION
  // ============================================================
  {
    id: 4001,
    name: "Salvation — Plan of",
    category: "Salvation",
    description: "The ordo salutis — from election to glorification",
    verses: [
      "Romans 8:29-30", "Ephesians 1:4-5", "John 6:37", "John 6:44",
      "John 10:27-29", "Acts 13:48", "Romans 3:24-25", "Romans 5:1",
      "Romans 5:9", "Romans 8:1", "Romans 8:30", "1 Corinthians 1:30",
      "2 Corinthians 5:17", "Ephesians 1:7", "Philippians 1:6",
      "Colossians 1:13-14", "2 Timothy 1:9", "Hebrews 10:14"
    ]
  },
  {
    id: 4002,
    name: "Grace",
    category: "Salvation",
    description: "God's unmerited favor — the foundation of salvation",
    verses: [
      "John 1:16-17", "Acts 15:11", "Romans 3:24", "Romans 4:16",
      "Romans 5:15", "Romans 5:20-21", "Romans 6:14", "Romans 11:6",
      "2 Corinthians 8:9", "2 Corinthians 12:9", "Galatians 2:21",
      "Ephesians 1:6", "Ephesians 2:5", "Ephesians 2:7-8",
      "2 Timothy 1:9", "Titus 2:11", "Titus 3:5", "Titus 3:7",
      "Hebrews 4:16", "James 4:6"
    ]
  },
  {
    id: 4003,
    name: "Faith",
    category: "Salvation",
    description: "Saving faith — its nature, object, and fruit",
    verses: [
      "Habakkuk 2:4", "Mark 11:22", "John 3:16", "John 3:36",
      "Acts 16:31", "Romans 1:17", "Romans 3:22", "Romans 4:3",
      "Romans 4:20-21", "Romans 5:1", "Romans 10:9", "Romans 10:17",
      "2 Corinthians 5:7", "Galatians 2:16", "Galatians 3:26",
      "Ephesians 2:8-9", "Hebrews 11:1", "Hebrews 11:6",
      "James 2:17", "James 2:26", "1 Peter 1:8-9"
    ]
  },
  {
    id: 4004,
    name: "Repentance",
    category: "Salvation",
    description: "Turning from sin to God — the gateway of conversion",
    verses: [
      "Isaiah 55:7", "Ezekiel 18:30", "Ezekiel 18:32", "Matthew 3:2",
      "Matthew 4:17", "Mark 1:15", "Luke 13:3", "Luke 15:7",
      "Luke 24:47", "Acts 2:38", "Acts 3:19", "Acts 11:18",
      "Acts 17:30", "Acts 20:21", "Acts 26:20", "2 Corinthians 7:10",
      "2 Peter 3:9", "Revelation 2:5"
    ]
  },
  {
    id: 4005,
    name: "Justification by Faith",
    category: "Salvation",
    description: "Declared righteous through faith in Christ alone",
    verses: [
      "Genesis 15:6", "Isaiah 53:11", "Habakkuk 2:4", "Romans 1:17",
      "Romans 3:21-22", "Romans 3:24", "Romans 3:26", "Romans 3:28",
      "Romans 4:5", "Romans 4:24-25", "Romans 5:1", "Romans 5:9",
      "Romans 5:18", "Romans 8:30", "Romans 8:33", "1 Corinthians 6:11",
      "Galatians 2:16", "Galatians 3:11", "Galatians 3:24",
      "Philippians 3:9", "Titus 3:7", "James 2:23"
    ]
  },
  {
    id: 4006,
    name: "Adoption",
    category: "Salvation",
    description: "Brought into God's family as sons and daughters",
    verses: [
      "John 1:12", "Romans 8:15", "Romans 8:16", "Romans 8:23",
      "Galatians 3:26", "Galatians 4:5-6", "Ephesians 1:5",
      "1 John 3:1", "1 John 3:2"
    ]
  },
  {
    id: 4007,
    name: "Assurance of Salvation",
    category: "Salvation",
    description: "The believer's confidence in eternal life",
    verses: [
      "John 5:24", "John 6:37", "John 10:28-29", "Romans 8:1",
      "Romans 8:16", "Romans 8:38-39", "2 Corinthians 1:22",
      "Ephesians 1:13-14", "Philippians 1:6", "2 Timothy 1:12",
      "Hebrews 6:11", "Hebrews 10:22", "1 John 3:14", "1 John 3:19",
      "1 John 5:13", "Jude 1:24"
    ]
  },
  {
    id: 4008,
    name: "Eternal Life",
    category: "Salvation",
    description: "The gift of life everlasting in Christ",
    verses: [
      "Daniel 12:2", "Matthew 25:46", "John 3:15-16", "John 3:36",
      "John 4:14", "John 5:24", "John 6:40", "John 6:47",
      "John 10:28", "John 17:2-3", "Romans 2:7", "Romans 6:23",
      "Galatians 6:8", "1 Timothy 6:12", "Titus 1:2",
      "1 John 2:25", "1 John 5:11", "1 John 5:13", "Jude 1:21"
    ]
  },

  // ============================================================
  // SCRIPTURE — The Word of God
  // ============================================================
  {
    id: 5001,
    name: "Scripture — Inspiration & Authority",
    category: "Scripture",
    description: "The divine origin and supreme authority of the Bible",
    verses: [
      "Psalm 19:7-8", "Psalm 119:89", "Psalm 119:160", "Isaiah 40:8",
      "Matthew 5:18", "Matthew 24:35", "John 10:35", "John 17:17",
      "2 Timothy 3:16-17", "Hebrews 4:12", "1 Peter 1:25",
      "2 Peter 1:20-21", "Revelation 22:18-19"
    ]
  },
  {
    id: 5002,
    name: "Scripture — Power & Profit",
    category: "Scripture",
    description: "What Scripture does — its transforming power in the believer",
    verses: [
      "Psalm 19:7-8", "Psalm 119:9", "Psalm 119:11", "Psalm 119:105",
      "Jeremiah 23:29", "John 6:63", "John 17:17", "Acts 20:32",
      "Romans 15:4", "Ephesians 6:17", "Colossians 3:16",
      "2 Timothy 3:16-17", "Hebrews 4:12", "James 1:22-25",
      "1 Peter 2:2"
    ]
  },

  // ============================================================
  // SIN & TEMPTATION
  // ============================================================
  {
    id: 6001,
    name: "Sin — Universality of",
    category: "Sin",
    description: "All have sinned — the universal human condition",
    verses: [
      "Genesis 6:5", "1 Kings 8:46", "2 Chronicles 6:36", "Job 15:14",
      "Psalm 14:2-3", "Psalm 51:5", "Psalm 143:2", "Proverbs 20:9",
      "Ecclesiastes 7:20", "Isaiah 53:6", "Isaiah 64:6", "Jeremiah 17:9",
      "Mark 7:21-23", "Romans 3:10-12", "Romans 3:23", "Romans 5:12",
      "Galatians 3:22", "1 John 1:8", "1 John 1:10"
    ]
  },
  {
    id: 6002,
    name: "Temptation",
    category: "Sin",
    description: "The nature of temptation and God's provision for victory",
    verses: [
      "Proverbs 1:10", "Matthew 4:1-11", "Matthew 26:41", "Luke 22:40",
      "1 Corinthians 10:13", "Galatians 6:1", "Ephesians 6:11",
      "1 Timothy 6:9", "Hebrews 2:18", "Hebrews 4:15-16",
      "James 1:13-14", "James 4:7", "1 Peter 5:8-9",
      "2 Peter 2:9", "1 John 2:16"
    ]
  },
  {
    id: 6003,
    name: "Forgiveness",
    category: "Sin",
    description: "God's pardon of sin through Christ's work",
    verses: [
      "Psalm 32:1", "Psalm 32:5", "Psalm 86:5", "Psalm 103:10-12",
      "Psalm 130:4", "Isaiah 1:18", "Isaiah 44:22", "Isaiah 55:7",
      "Jeremiah 31:34", "Micah 7:18-19", "Matthew 6:14-15",
      "Mark 11:25", "Acts 13:38-39", "Ephesians 1:7",
      "Ephesians 4:32", "Colossians 1:14", "Colossians 2:13",
      "Colossians 3:13", "1 John 1:9"
    ]
  },

  // ============================================================
  // CHRISTIAN LIFE — Growth & Virtues
  // ============================================================
  {
    id: 7001,
    name: "Sanctification",
    category: "Christian Life",
    description: "Growing in holiness — the Spirit's work and the believer's pursuit",
    verses: [
      "John 17:17", "John 17:19", "Acts 20:32", "Romans 6:19",
      "Romans 6:22", "Romans 12:1-2", "1 Corinthians 1:2",
      "1 Corinthians 6:11", "2 Corinthians 3:18", "2 Corinthians 7:1",
      "Ephesians 5:26", "Philippians 1:6", "Philippians 2:12-13",
      "1 Thessalonians 4:3", "1 Thessalonians 5:23", "2 Timothy 2:21",
      "Hebrews 10:14", "Hebrews 12:10", "Hebrews 12:14",
      "Hebrews 13:12", "1 Peter 1:15-16", "1 John 3:3"
    ]
  },
  {
    id: 7002,
    name: "Prayer",
    category: "Christian Life",
    description: "Communion with God — command, privilege, and power",
    verses: [
      "2 Chronicles 7:14", "Psalm 55:17", "Psalm 66:18", "Psalm 145:18",
      "Proverbs 15:8", "Proverbs 15:29", "Isaiah 59:2", "Jeremiah 33:3",
      "Matthew 6:6", "Matthew 6:9-13", "Matthew 7:7-8", "Matthew 21:22",
      "Mark 11:24", "Luke 18:1", "John 14:13-14", "John 15:7",
      "John 16:24", "Acts 1:14", "Romans 8:26", "Ephesians 6:18",
      "Philippians 4:6", "Colossians 4:2", "1 Thessalonians 5:17",
      "1 Timothy 2:8", "Hebrews 4:16", "James 1:5-6",
      "James 5:16", "1 John 5:14-15"
    ]
  },
  {
    id: 7003,
    name: "Love — God's and Ours",
    category: "Christian Life",
    description: "Love as the supreme virtue — from God, for God, for others",
    verses: [
      "Deuteronomy 6:5", "Leviticus 19:18", "Matthew 5:44", "Matthew 22:37-39",
      "Mark 12:30-31", "Luke 6:27", "Luke 6:35", "Luke 10:27",
      "John 13:34-35", "John 14:15", "John 14:21", "John 15:12-13",
      "John 15:17", "Romans 5:5", "Romans 8:35", "Romans 12:9-10",
      "Romans 13:8", "Romans 13:10", "1 Corinthians 13:1-8",
      "1 Corinthians 13:13", "Galatians 5:13-14", "Ephesians 3:17-19",
      "Ephesians 5:2", "Colossians 3:14", "1 Thessalonians 4:9",
      "Hebrews 13:1", "1 Peter 1:22", "1 Peter 4:8",
      "1 John 3:18", "1 John 4:7-8", "1 John 4:11-12",
      "1 John 4:16", "1 John 4:18-21"
    ]
  },
  {
    id: 7004,
    name: "Hope",
    category: "Christian Life",
    description: "Living hope — the anchor of the soul in Christ's return",
    verses: [
      "Job 13:15", "Psalm 31:24", "Psalm 33:18", "Psalm 33:22",
      "Psalm 39:7", "Psalm 42:5", "Psalm 71:5", "Psalm 130:5",
      "Psalm 146:5", "Proverbs 10:28", "Proverbs 23:18",
      "Jeremiah 29:11", "Lamentations 3:24", "Joel 3:16",
      "Zechariah 9:12", "Acts 23:6", "Acts 24:15", "Romans 5:2",
      "Romans 5:4-5", "Romans 8:24-25", "Romans 12:12", "Romans 15:4",
      "Romans 15:13", "1 Corinthians 13:13", "2 Corinthians 3:12",
      "Ephesians 1:18", "Colossians 1:27", "1 Thessalonians 5:8",
      "Titus 1:2", "Titus 2:13", "Hebrews 6:11", "Hebrews 6:18-19",
      "Hebrews 10:23", "1 Peter 1:3", "1 Peter 1:13", "1 Peter 3:15",
      "1 John 3:3"
    ]
  },
  {
    id: 7005,
    name: "Joy",
    category: "Christian Life",
    description: "Joy in the Lord — deeper than circumstance",
    verses: [
      "Nehemiah 8:10", "Psalm 5:11", "Psalm 16:11", "Psalm 30:5",
      "Psalm 51:12", "Psalm 126:5", "Isaiah 12:3", "Isaiah 35:10",
      "Habakkuk 3:17-18", "Luke 10:20", "John 15:11", "John 16:22",
      "John 16:24", "Acts 13:52", "Romans 14:17", "Romans 15:13",
      "2 Corinthians 7:4", "Galatians 5:22", "Philippians 1:4",
      "Philippians 4:4", "1 Thessalonians 1:6", "1 Thessalonians 5:16",
      "James 1:2", "1 Peter 1:8", "1 Peter 4:13"
    ]
  },
  {
    id: 7006,
    name: "Peace",
    category: "Christian Life",
    description: "The peace of God — with God, from God, with others",
    verses: [
      "Numbers 6:24-26", "Psalm 29:11", "Psalm 37:11", "Psalm 119:165",
      "Proverbs 3:17", "Isaiah 26:3", "Isaiah 32:17", "Isaiah 48:18",
      "Isaiah 54:13", "Ezekiel 37:26", "John 14:27", "John 16:33",
      "Acts 10:36", "Romans 5:1", "Romans 8:6", "Romans 14:17",
      "Romans 15:13", "1 Corinthians 14:33", "Galatians 5:22",
      "Ephesians 2:14", "Ephesians 2:17", "Philippians 4:6-7",
      "Colossians 3:15", "2 Thessalonians 3:16", "Hebrews 12:11"
    ]
  },
  {
    id: 7007,
    name: "Humility",
    category: "Christian Life",
    description: "The grace of lowliness — Christ's example, the believer's calling",
    verses: [
      "Proverbs 11:2", "Proverbs 15:33", "Proverbs 22:4", "Proverbs 29:23",
      "Isaiah 57:15", "Isaiah 66:2", "Micah 6:8", "Matthew 5:3",
      "Matthew 18:3-4", "Matthew 23:12", "Mark 10:43-45",
      "Luke 14:11", "Luke 18:14", "John 13:4-5", "John 13:14-15",
      "Acts 20:19", "Romans 12:3", "Romans 12:16", "2 Corinthians 11:30",
      "Ephesians 4:2", "Philippians 2:3", "Philippians 2:5-8",
      "Colossians 3:12", "James 4:6", "James 4:10", "1 Peter 5:5-6"
    ]
  },
  {
    id: 7008,
    name: "Obedience",
    category: "Christian Life",
    description: "The believer's glad submission to God's commands",
    verses: [
      "Deuteronomy 28:1-2", "Joshua 1:8", "1 Samuel 15:22",
      "Psalm 119:2", "Psalm 119:4", "Proverbs 3:1-2",
      "Ecclesiastes 12:13", "Isaiah 1:19", "Jeremiah 7:23",
      "Matthew 7:21", "Matthew 7:24", "Luke 6:46", "Luke 11:28",
      "John 14:15", "John 14:21", "John 14:23", "John 15:10",
      "John 15:14", "Acts 5:29", "Romans 6:16", "2 Corinthians 10:5",
      "Hebrews 5:8-9", "James 1:22", "James 1:25",
      "1 Peter 1:14", "1 John 2:3", "1 John 3:22", "1 John 5:3"
    ]
  },

  // ============================================================
  // SUFFERING & TRIALS
  // ============================================================
  {
    id: 8001,
    name: "Suffering — Purpose in",
    category: "Suffering",
    description: "God's purposes in the suffering of His people",
    verses: [
      "Job 23:10", "Psalm 34:19", "Psalm 119:67", "Psalm 119:71",
      "Psalm 119:75", "Isaiah 48:10", "John 15:2", "Acts 14:22",
      "Romans 5:3-5", "Romans 8:17", "Romans 8:18", "Romans 8:28",
      "2 Corinthians 1:4-5", "2 Corinthians 4:17", "2 Corinthians 12:9-10",
      "Philippians 1:29", "Hebrews 12:5-6", "Hebrews 12:10-11",
      "James 1:2-4", "James 1:12", "1 Peter 1:6-7",
      "1 Peter 4:12-13", "1 Peter 5:10"
    ]
  },
  {
    id: 8002,
    name: "Comfort in Affliction",
    category: "Suffering",
    description: "God's comfort for His suffering children",
    verses: [
      "Deuteronomy 33:27", "Psalm 23:4", "Psalm 27:5", "Psalm 34:18",
      "Psalm 46:1", "Psalm 55:22", "Psalm 91:1-2", "Psalm 147:3",
      "Isaiah 41:10", "Isaiah 43:2", "Isaiah 49:13", "Isaiah 54:10",
      "Isaiah 63:9", "Jeremiah 31:13", "Lamentations 3:32",
      "Nahum 1:7", "Matthew 5:4", "Matthew 11:28-30",
      "John 14:1", "John 14:27", "Romans 8:18", "2 Corinthians 1:3-4",
      "2 Corinthians 7:6", "1 Thessalonians 4:18", "Hebrews 4:15"
    ]
  },
  {
    id: 8003,
    name: "Trials — Refining Fire",
    category: "Suffering",
    description: "Testing that purifies faith and produces character",
    verses: [
      "Job 23:10", "Psalm 66:10", "Psalm 66:12", "Proverbs 17:3",
      "Isaiah 48:10", "Zechariah 13:9", "Malachi 3:3",
      "Romans 5:3-5", "1 Corinthians 3:13", "2 Corinthians 4:17",
      "Hebrews 12:11", "James 1:2-4", "1 Peter 1:7", "1 Peter 4:12",
      "Revelation 3:18"
    ]
  },

  // ============================================================
  // THE CHURCH
  // ============================================================
  {
    id: 9001,
    name: "The Church — Body of Christ",
    category: "Church",
    description: "The church as Christ's body — unity, diversity, purpose",
    verses: [
      "Matthew 16:18", "Acts 2:42", "Acts 2:47", "Romans 12:4-5",
      "1 Corinthians 12:12-14", "1 Corinthians 12:27", "Ephesians 1:22-23",
      "Ephesians 2:19-22", "Ephesians 3:10", "Ephesians 4:4-6",
      "Ephesians 4:11-13", "Ephesians 4:15-16", "Ephesians 5:23",
      "Ephesians 5:25-27", "Colossians 1:18", "Colossians 1:24",
      "Colossians 2:19", "Colossians 3:15", "Hebrews 10:24-25",
      "1 Peter 2:5", "1 Peter 2:9"
    ]
  },
  {
    id: 9002,
    name: "Worship",
    category: "Church",
    description: "Glorifying God — in spirit, in truth, in all of life",
    verses: [
      "1 Chronicles 16:29", "Psalm 29:2", "Psalm 95:6", "Psalm 96:9",
      "Psalm 100:2", "Psalm 100:4", "Psalm 132:7", "Matthew 4:10",
      "John 4:23-24", "Acts 2:42", "Romans 12:1", "1 Corinthians 14:26",
      "Ephesians 5:19", "Colossians 3:16", "Hebrews 10:25",
      "Hebrews 12:28", "James 5:13", "Revelation 4:10-11",
      "Revelation 5:12-13", "Revelation 7:11-12", "Revelation 15:4"
    ]
  },
  {
    id: 9003,
    name: "Fellowship",
    category: "Church",
    description: "Koinonia — shared life in Christ's body",
    verses: [
      "Psalm 55:14", "Malachi 3:16", "Acts 2:42", "Acts 2:44-46",
      "Romans 12:10", "Romans 12:13", "Romans 15:7", "2 Corinthians 13:11",
      "Galatians 6:2", "Ephesians 4:2-3", "Philippians 2:1-2",
      "Colossians 3:16", "1 Thessalonians 5:11", "Hebrews 3:13",
      "Hebrews 10:24-25", "James 5:16", "1 Peter 4:9",
      "1 John 1:3", "1 John 1:7"
    ]
  },
  {
    id: 9004,
    name: "The Lord's Supper",
    category: "Church",
    description: "Communion — remembrance, proclamation, participation",
    verses: [
      "Matthew 26:26-28", "Mark 14:22-24", "Luke 22:19-20",
      "John 6:53-56", "Acts 2:42", "Acts 20:7",
      "1 Corinthians 10:16-17", "1 Corinthians 11:23-29"
    ]
  },
  {
    id: 9005,
    name: "Baptism",
    category: "Church",
    description: "The sign and seal of covenant entrance",
    verses: [
      "Matthew 3:13-17", "Matthew 28:19", "Mark 16:16", "John 3:5",
      "Acts 2:38", "Acts 2:41", "Acts 8:36-38", "Acts 10:47-48",
      "Acts 16:15", "Acts 16:33", "Acts 19:5", "Acts 22:16",
      "Romans 6:3-4", "1 Corinthians 1:14-16", "1 Corinthians 12:13",
      "Galatians 3:27", "Ephesians 4:5", "Colossians 2:12",
      "1 Peter 3:21"
    ]
  },

  // ============================================================
  // END TIMES
  // ============================================================
  {
    id: 10001,
    name: "Heaven",
    category: "End Times",
    description: "The eternal dwelling of God and His redeemed people",
    verses: [
      "Psalm 16:11", "Psalm 23:6", "Psalm 73:24-25", "Isaiah 65:17",
      "Isaiah 66:22", "Matthew 5:12", "Matthew 6:20", "Matthew 25:34",
      "Luke 10:20", "John 14:2-3", "John 17:24", "1 Corinthians 2:9",
      "2 Corinthians 5:1", "Philippians 3:20", "Colossians 1:5",
      "1 Thessalonians 4:17", "Hebrews 11:16", "1 Peter 1:4",
      "2 Peter 3:13", "Revelation 2:7", "Revelation 7:15-17",
      "Revelation 21:1-4", "Revelation 21:22-23", "Revelation 22:3-5"
    ]
  },
  {
    id: 10002,
    name: "Judgment",
    category: "End Times",
    description: "God's righteous judgment — final, universal, inescapable",
    verses: [
      "Psalm 9:7-8", "Psalm 96:13", "Ecclesiastes 12:14", "Daniel 7:10",
      "Matthew 12:36", "Matthew 25:31-32", "John 5:22", "John 5:27",
      "John 12:48", "Acts 10:42", "Acts 17:31", "Romans 2:5-6",
      "Romans 2:16", "Romans 14:10", "Romans 14:12",
      "1 Corinthians 3:13-15", "2 Corinthians 5:10", "2 Timothy 4:1",
      "Hebrews 9:27", "2 Peter 2:9", "2 Peter 3:7",
      "1 John 4:17", "Jude 1:6", "Revelation 20:12-13"
    ]
  },
  {
    id: 10003,
    name: "Resurrection of the Dead",
    category: "End Times",
    description: "The raising of the dead — Christ's and ours",
    verses: [
      "Job 19:25-27", "Psalm 49:15", "Isaiah 26:19", "Daniel 12:2",
      "Hosea 13:14", "Matthew 22:31-32", "Luke 14:14", "John 5:28-29",
      "John 6:39-40", "John 6:44", "John 11:25", "Acts 23:6",
      "Acts 24:15", "Romans 6:5", "1 Corinthians 15:20-23",
      "1 Corinthians 15:42-44", "1 Corinthians 15:51-53",
      "Philippians 3:10-11", "Philippians 3:21", "1 Thessalonians 4:14-16",
      "Revelation 20:5-6"
    ]
  },

  // ============================================================
  // PROMISES & COVENANTS
  // ============================================================
  {
    id: 11001,
    name: "The New Covenant",
    category: "Covenants",
    description: "The better covenant — inaugurated by Christ, written on hearts",
    verses: [
      "Jeremiah 31:31-34", "Ezekiel 36:26-27", "Matthew 26:28",
      "Mark 14:24", "Luke 22:20", "1 Corinthians 11:25",
      "2 Corinthians 3:6", "Hebrews 7:22", "Hebrews 8:6-10",
      "Hebrews 8:13", "Hebrews 9:15", "Hebrews 10:16-17",
      "Hebrews 12:24", "Hebrews 13:20"
    ]
  },
  {
    id: 11002,
    name: "Promises of God",
    category: "Covenants",
    description: "The exceeding great and precious promises",
    verses: [
      "Numbers 23:19", "Deuteronomy 31:8", "Joshua 21:45", "Joshua 23:14",
      "1 Kings 8:56", "Psalm 37:4", "Psalm 84:11", "Psalm 145:13",
      "Isaiah 41:10", "Isaiah 54:17", "Jeremiah 33:3",
      "Matthew 11:28", "John 14:13-14", "Romans 8:28", "Romans 8:32",
      "2 Corinthians 1:20", "Philippians 4:19", "2 Timothy 1:7",
      "Hebrews 13:5", "James 1:5", "2 Peter 1:4"
    ]
  },

  // ============================================================
  // DISCIPLESHIP
  // ============================================================
  {
    id: 12001,
    name: "Discipleship — Cost of",
    category: "Discipleship",
    description: "Counting the cost of following Jesus",
    verses: [
      "Matthew 8:19-20", "Matthew 10:22", "Matthew 10:37-39",
      "Matthew 16:24-25", "Mark 8:34-35", "Luke 9:23-24",
      "Luke 9:57-62", "Luke 14:26-27", "Luke 14:33",
      "John 12:25-26", "John 15:18-20", "Acts 14:22",
      "Philippians 3:7-8", "2 Timothy 3:12"
    ]
  },
  {
    id: 12002,
    name: "The Great Commission",
    category: "Discipleship",
    description: "Christ's mandate to make disciples of all nations",
    verses: [
      "Matthew 28:18-20", "Mark 16:15", "Luke 24:46-48",
      "John 20:21", "Acts 1:8", "Acts 13:47", "Romans 10:14-15",
      "1 Corinthians 9:16", "2 Corinthians 5:18-20", "Colossians 1:28"
    ]
  },
  {
    id: 12003,
    name: "Abiding in Christ",
    category: "Discipleship",
    description: "Remaining in Christ — the secret of fruitfulness",
    verses: [
      "John 15:4-5", "John 15:7", "John 15:9-10", "John 6:56",
      "Romans 8:1", "Romans 12:1", "2 Corinthians 5:17",
      "Galatians 2:20", "Ephesians 3:17", "Philippians 1:21",
      "Colossians 2:6-7", "1 John 2:6", "1 John 2:27-28",
      "1 John 3:6", "1 John 3:24", "1 John 4:13", "1 John 4:15-16"
    ]
  },

  // ============================================================
  // WISDOM & THE FEAR OF THE LORD
  // ============================================================
  {
    id: 13001,
    name: "The Fear of the Lord",
    category: "Wisdom",
    description: "Reverent awe — the beginning of wisdom and knowledge",
    verses: [
      "Deuteronomy 10:12", "Job 28:28", "Psalm 19:9", "Psalm 25:14",
      "Psalm 33:8", "Psalm 34:9", "Psalm 103:11", "Psalm 111:10",
      "Psalm 112:1", "Psalm 147:11", "Proverbs 1:7", "Proverbs 8:13",
      "Proverbs 9:10", "Proverbs 10:27", "Proverbs 14:26-27",
      "Proverbs 15:16", "Proverbs 16:6", "Proverbs 19:23",
      "Ecclesiastes 12:13", "Isaiah 11:2", "Isaiah 33:6",
      "Acts 9:31", "2 Corinthians 7:1", "Philippians 2:12",
      "Hebrews 12:28"
    ]
  },

  // ============================================================
  // FAMILY & RELATIONSHIPS
  // ============================================================
  {
    id: 14001,
    name: "Marriage",
    category: "Family",
    description: "God's design for marriage — covenant, companionship, Christ and the Church",
    verses: [
      "Genesis 2:18", "Genesis 2:23-24", "Proverbs 18:22", "Proverbs 19:14",
      "Proverbs 31:10", "Song of Solomon 8:6-7", "Malachi 2:14",
      "Matthew 19:4-6", "Matthew 19:8-9", "Mark 10:6-9",
      "Romans 7:2", "1 Corinthians 7:2-5", "1 Corinthians 7:10-11",
      "1 Corinthians 7:14", "Ephesians 5:22-25", "Ephesians 5:28-33",
      "Colossians 3:18-19", "1 Timothy 3:2", "1 Timothy 4:3",
      "Hebrews 13:4", "1 Peter 3:1-7"
    ]
  },
  {
    id: 14002,
    name: "Children & Parenting",
    category: "Family",
    description: "Raising children in the nurture and admonition of the Lord",
    verses: [
      "Deuteronomy 6:6-7", "Psalm 78:4-6", "Psalm 127:3", "Psalm 127:5",
      "Proverbs 13:24", "Proverbs 19:18", "Proverbs 22:6", "Proverbs 22:15",
      "Proverbs 23:13-14", "Proverbs 29:15", "Proverbs 29:17",
      "Isaiah 54:13", "Malachi 4:6", "Matthew 18:5-6",
      "Matthew 19:14", "Mark 10:14", "Luke 18:16",
      "Ephesians 6:1-4", "Colossians 3:20-21", "1 Timothy 3:4",
      "Titus 2:4", "Hebrews 12:7"
    ]
  },

  // ============================================================
  // FAITH, HOPE, LOVE (1 Cor 13:13 triad)
  // ============================================================
  {
    id: 15001,
    name: "Faith, Hope, Love — The Triad",
    category: "Cardinal Virtues",
    description: "The three abiding virtues of 1 Corinthians 13:13 traced through Scripture",
    verses: [
      "Psalm 33:18-22", "Jeremiah 17:7-8", "1 Corinthians 13:13",
      "Galatians 5:5-6", "Ephesians 1:15-18", "Ephesians 4:2-5",
      "Colossians 1:4-5", "1 Thessalonians 1:3", "1 Thessalonians 5:8",
      "2 Thessalonians 1:3", "1 Timothy 6:11", "2 Timothy 2:22",
      "Titus 2:2", "Hebrews 6:10-12", "Hebrews 10:22-24",
      "1 Peter 1:21-22", "2 Peter 1:5-7", "1 John 4:16-18"
    ]
  }
];

/**
 * Category groupings for navigation
 */
export const chainCategories: ChainCategory[] = [
  { name: "God", topics: [1001, 1002, 1003, 1004, 1005] },
  { name: "Jesus Christ", topics: [2001, 2002, 2003, 2004, 2005] },
  { name: "Holy Spirit", topics: [3001, 3002, 3003] },
  { name: "Salvation", topics: [4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008] },
  { name: "Scripture", topics: [5001, 5002] },
  { name: "Sin", topics: [6001, 6002, 6003] },
  { name: "Christian Life", topics: [7001, 7002, 7003, 7004, 7005, 7006, 7007, 7008] },
  { name: "Suffering", topics: [8001, 8002, 8003] },
  { name: "Church", topics: [9001, 9002, 9003, 9004, 9005] },
  { name: "End Times", topics: [10001, 10002, 10003] },
  { name: "Covenants", topics: [11001, 11002] },
  { name: "Discipleship", topics: [12001, 12002, 12003] },
  { name: "Wisdom", topics: [13001] },
  { name: "Family", topics: [14001, 14002] },
  { name: "Cardinal Virtues", topics: [15001] }
];

/** Lookup map for O(1) access */
export const chainTopicMap = new Map<number, ChainTopic>(
  chainTopics.map(t => [t.id, t])
);

/** Find which chains (if any) contain a given verse reference */
export function findChainsForVerse(reference: string): ChainTopic[] {
  const normalized = reference.trim().replace(/\s+/g, ' ');
  return chainTopics.filter(topic =>
    topic.verses.some(v => v.trim().replace(/\s+/g, ' ') === normalized)
  );
}

/** Search topics by name or description */
export function searchChains(query: string): ChainTopic[] {
  const q = query.toLowerCase();
  return chainTopics.filter(topic =>
    topic.name.toLowerCase().includes(q) ||
    topic.description.toLowerCase().includes(q) ||
    topic.category.toLowerCase().includes(q)
  );
}
