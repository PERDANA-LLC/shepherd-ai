#!/usr/bin/env python3
"""Download all 66 KJV book JSONs and merge into a single file."""
import json
import urllib.request
import time
import os

BASE_URL = "https://raw.githubusercontent.com/aruljohn/Bible-kjv/master"
BOOKS = [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
    "Joshua", "Judges", "Ruth", "1Samuel", "2Samuel",
    "1Kings", "2Kings", "1Chronicles", "2Chronicles",
    "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
    "Ecclesiastes", "SongofSolomon", "Isaiah", "Jeremiah",
    "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
    "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
    "Zephaniah", "Haggai", "Zechariah", "Malachi",
    "Matthew", "Mark", "Luke", "John", "Acts",
    "Romans", "1Corinthians", "2Corinthians", "Galatians",
    "Ephesians", "Philippians", "Colossians",
    "1Thessalonians", "2Thessalonians", "1Timothy", "2Timothy",
    "Titus", "Philemon", "Hebrews", "James",
    "1Peter", "2Peter", "1John", "2John", "3John",
    "Jude", "Revelation"
]

# Display name map (e.g., "SongofSolomon" → "Song of Solomon")
DISPLAY_NAMES = {
    "SongofSolomon": "Song of Solomon",
    "1Samuel": "1 Samuel", "2Samuel": "2 Samuel",
    "1Kings": "1 Kings", "2Kings": "2 Kings",
    "1Chronicles": "1 Chronicles", "2Chronicles": "2 Chronicles",
    "1Corinthians": "1 Corinthians", "2Corinthians": "2 Corinthians",
    "1Thessalonians": "1 Thessalonians", "2Thessalonians": "2 Thessalonians",
    "1Timothy": "1 Timothy", "2Timothy": "2 Timothy",
    "1Peter": "1 Peter", "2Peter": "2 Peter",
    "1John": "1 John", "2John": "2 John", "3John": "3 John",
}

all_verses = []
total = len(BOOKS)

for i, book_file in enumerate(BOOKS):
    url = f"{BASE_URL}/{book_file}.json"
    print(f"[{i+1}/{total}] Downloading {book_file}...", end=" ")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Shepherd-AI/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
        
        display_name = DISPLAY_NAMES.get(book_file, data.get("book", book_file))
        count = 0
        
        for chapter_data in data["chapters"]:
            ch_num = int(chapter_data["chapter"])
            for verse_data in chapter_data["verses"]:
                all_verses.append({
                    "book": display_name,
                    "book_id": book_file,
                    "chapter": ch_num,
                    "verse": int(verse_data["verse"]),
                    "text": verse_data["text"].strip()
                })
                count += 1
        
        print(f"✓ {count} verses")
        time.sleep(0.3)  # Be polite to GitHub
    except Exception as e:
        print(f"✗ ERROR: {e}")

# Save merged file
output_dir = "/root/shepherd-ai/data"
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "kjv.json")

with open(output_path, "w") as f:
    json.dump(all_verses, f, ensure_ascii=False)

# Stats
print(f"\n✅ Done! {len(all_verses)} verses saved to {output_path}")
print(f"   File size: {os.path.getsize(output_path) / 1024 / 1024:.1f} MB")
print(f"   Books: {len(set(v['book'] for v in all_verses))}")

# Sample
for v in all_verses:
    if v["book"] == "John" and v["chapter"] == 3 and v["verse"] == 16:
        print(f"\n   Sample: {v}")
        break
