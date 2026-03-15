import csv
import json
import re
import time
import os
import requests

INPUT_CSV = "books.csv"
SEED_JSON = "../prisma/seed.json"
REVIEW_CSV = "../prisma/review.csv"
COVERS_DIR = "../public/covers"
MAX_ENTRIES = 100

os.makedirs(COVERS_DIR, exist_ok=True)

def clean_isbn(raw: str) -> str | None:
    if not raw:
        return None
    # Strip "ISBN: " prefix
    raw = re.sub(r"(?i)isbn:\s*", "", raw)
    # Extract just the ISBN digits/hyphens (first match)
    match = re.search(r"[\d\-X]{9,17}", raw)
    if not match:
        return None
    isbn = match.group().replace("-", "").strip()
    # Accept ISBN-10 or ISBN-13
    if len(isbn) in (10, 13):
        return match.group().strip()  # keep hyphens for readability
    return None

def clean_author(raw: str) -> str | None:
    if not raw:
        return None
    # Remove trailing period and birth/death years like ", 1952-" or ", 1857-"
    author = re.sub(r",?\s*\d{4}-\d*\.?$", "", raw).strip()
    author = author.rstrip(".,").strip()
    return author if author else None

def clean_lccn(raw: str) -> str | None:
    if not raw:
        return None
    lccn = re.sub(r"(?i)lccn:\s*", "", raw).strip()
    return lccn if lccn else None

def get_cover(isbn: str) -> str | None:
    """Download cover from OpenLibrary. Returns local path or None."""
    clean = isbn.replace("-", "")
    url = f"https://covers.openlibrary.org/b/isbn/{clean}-L.jpg"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200 and len(response.content) > 1000:
            filename = f"{clean}.jpg"
            filepath = os.path.join(COVERS_DIR, filename)
            with open(filepath, "wb") as f:
                f.write(response.content)
            return f"/covers/{filename}"  # Nuxt serves public/ at root
    except requests.RequestException:
        pass
    return None

def flag_reason(row: dict) -> str | None:
    if not row.get("title") and not row.get("callNumber"):
        return "missing title and call number"
    if not row.get("isbn"):
        return "missing ISBN"
    return None

# --- Parse CSV ---
seed = []
review = []
seen_titles = {}  # title -> first call number seen

with open(INPUT_CSV, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)

    for row in reader:
        call_number = row.get("Call Number", "").strip()
        title       = row.get("Title", "").strip()
        author      = clean_author(row.get("Author", ""))
        isbn        = clean_isbn(row.get("Standard Number", ""))
        lccn        = clean_lccn(row.get("LCCN", ""))

        entry = {
            "callNumber": call_number,
            "title": title,
            "author": author,
            "isbn": isbn,
            "lccn": lccn,
            "image": None,
        }

        # Flag if missing title+callNumber or ISBN
        reason = flag_reason(entry)
        if reason:
            entry["flagReason"] = reason
            review.append(entry)
            continue

        # Deduplicate by title — keep first, flag rest
        if title in seen_titles:
            entry["flagReason"] = f"duplicate title, first seen at call number '{seen_titles[title]}'"
            review.append(entry)
            continue
        seen_titles[title] = call_number

        # Enforce limit
        if len(seed) >= MAX_ENTRIES:
            entry["flagReason"] = "over 100-entry limit"
            review.append(entry)
            continue

        # Query OpenLibrary
        cover_path = get_cover(isbn)
        if cover_path:
            entry["image"] = cover_path
        else:
            entry["flagReason"] = "no cover found on OpenLibrary"
            review.append(entry)
            continue

        seed.append(entry)
        print(f"[{len(seed)}/100] ✓ {title}")
        time.sleep(0.5)

# --- Write outputs ---
with open(SEED_JSON, "w", encoding="utf-8") as f:
    json.dump(seed, f, indent=2, default=str)

with open(REVIEW_CSV, "w", newline="", encoding="utf-8") as f:
    if review:
        writer = csv.DictWriter(f, fieldnames=review[0].keys())
        writer.writeheader()
        writer.writerows(review)

print(f"\nDone. {len(seed)} seeded, {len(review)} flagged for review.")
