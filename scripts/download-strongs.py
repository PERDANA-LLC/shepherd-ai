#!/usr/bin/env python3
"""
Download and extract Strong's Concordance dictionary from the 'strongs' npm package.
Saves compact JSON to data/strongs.json for use by the /api/strongs route.

Run: python3 scripts/download-strongs.py
Requires: npm (to pack the strongs package)
"""

import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
OUTPUT = DATA_DIR / "strongs.json"

def extract_js_dict(filepath: Path) -> dict:
    """Extract the JS variable assignment as JSON from a strongs dictionary .js file."""
    text = filepath.read_text(encoding="utf-8")
    # Match: var name = {...}; [module.exports = name;]
    match = re.search(r"var \w+\s*=\s*(\{.*?\});\s*(?:module\.exports|$)", text, re.DOTALL)
    if not match:
        raise ValueError(f"Could not find dictionary object in {filepath.name}")
    return json.loads(match.group(1))


def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    print("📦 Downloading 'strongs' npm package...")
    with tempfile.TemporaryDirectory() as tmp:
        # Pack the npm package
        subprocess.run(
            ["npm", "pack", "strongs", "--pack-destination", tmp],
            cwd=tmp,
            check=True,
            capture_output=True,
            env={**os.environ, "NODE_PATH": ""},
        )

        # Find the tarball
        tarballs = list(Path(tmp).glob("strongs-*.tgz"))
        if not tarballs:
            print("❌ Could not find strongs tarball after npm pack", file=sys.stderr)
            sys.exit(1)

        tarball = tarballs[0]
        print(f"   Got {tarball.name}")

        # Extract only the dictionary files
        extract_dir = Path(tmp) / "extracted"
        extract_dir.mkdir()
        subprocess.run(
            [
                "tar", "xzf", str(tarball), "-C", str(extract_dir),
                "--strip-components=1",
                "package/hebrew/strongs-hebrew-dictionary.js",
                "package/greek/strongs-greek-dictionary.js",
            ],
            check=True,
        )

        greek_file = extract_dir / "greek" / "strongs-greek-dictionary.js"
        hebrew_file = extract_dir / "hebrew" / "strongs-hebrew-dictionary.js"

        print("📖 Extracting Greek dictionary...")
        greek = extract_js_dict(greek_file)
        print(f"   {len(greek):,} entries")

        print("📖 Extracting Hebrew dictionary...")
        hebrew = extract_js_dict(hebrew_file)
        print(f"   {len(hebrew):,} entries")

        # Write compact JSON
        combined = {"greek": greek, "hebrew": hebrew}
        OUTPUT.write_text(json.dumps(combined, separators=(",", ":")), encoding="utf-8")

        size_kb = OUTPUT.stat().st_size / 1024
        print(f"\n✅ Saved {OUTPUT} ({size_kb:,.0f} KB)")
        print(f"   Total: {len(greek):,} Greek + {len(hebrew):,} Hebrew = {len(greek) + len(hebrew):,} entries")


if __name__ == "__main__":
    main()
