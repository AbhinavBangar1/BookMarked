import requests
import csv
import time
import os

SEARCH_SUBJECT = "horror"
CUSTOM_TAG = "bestseller"
MAX_BOOKS = 30
BASE_SEARCH_URL = "https://openlibrary.org/search.json"
BOOKS_API = "https://openlibrary.org/books/"
WORKS_API = "https://openlibrary.org/works/"
AUTHORS_API = "https://openlibrary.org/authors/"

books_data = []
authors_data = {}
genres_data = {}

def safe_description(desc):
    if isinstance(desc, dict):
        return desc.get("value")
    return desc

def get_work_id_from_edition(edition_id):
    try:
        r = requests.get(f"{BOOKS_API}{edition_id}.json")
        if r.status_code != 200:
            return None
        data = r.json()
        works = data.get("works")
        if works:
            return works[0]["key"].split("/")[-1]
    except:
        return None
    return None

def fetch_work(work_id):
    work_url = f"{WORKS_API}{work_id}.json"
    print(f"Fetching work URL: {work_url}")
    try:
        r = requests.get(work_url)
        if r.status_code != 200:
            return None
        return r.json()
    except:
        return None

def fetch_author(author_id):
    if author_id in authors_data:
        return
    try:
        r = requests.get(f"{AUTHORS_API}{author_id}.json")
        if r.status_code != 200:
            return
        name = r.json().get("name")
        authors_data[author_id] = {
            "authorid": author_id,
            "name": name,
        }
    except:
        return

def load_existing_csv(filename, key_field):
    existing = {}
    if os.path.exists(filename):
        with open(filename, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                existing[row[key_field]] = row
    return existing


books_existing = load_existing_csv("books.csv", "bookid")
authors_existing = load_existing_csv("author.csv", "authorid")
genres_existing = load_existing_csv("genre.csv", "genreid")


print(f"Fetching subject: {SEARCH_SUBJECT}")

page = 1
while len(books_data) < MAX_BOOKS:
    print(f"Processing page {page}")
    params = {
        "subject": SEARCH_SUBJECT,
        "page": page,
        "sort": "rating"
    }
    r = requests.get(BASE_SEARCH_URL, params=params)
    if r.status_code != 200:
        break

    docs = r.json().get("docs", [])
    if not docs:
        break

    for doc in docs:
        if len(books_data) >= MAX_BOOKS:
            break

        edition_id = doc.get("cover_edition_key")
        if not edition_id:
            continue

        work_id = get_work_id_from_edition(edition_id)
        if not work_id or work_id in books_existing or any(b["bookid"] == work_id for b in books_data):
            continue

        work = fetch_work(work_id)
        if not work:
            continue

        title = work.get("title")
        description = safe_description(work.get("description"))
        publishedyear = doc.get("first_publish_year")

        isbn = None
        if doc.get("ia"):
            for item in doc["ia"]:
                if item.startswith("isbn_"):
                    isbn = item.replace("isbn_", "")
                    break

        publisher = doc.get("publisher", [None])[0] if doc.get("publisher") else None

        author_id = None
        author_keys = doc.get("author_key")
        if author_keys:
            author_id = author_keys[0]
            if author_id not in authors_existing:
                fetch_author(author_id)


        genre_id = SEARCH_SUBJECT.lower().replace(" ", "_")
        if genre_id not in genres_existing:
            genres_data[genre_id] = {
                "genreid": genre_id,
                "genrename": SEARCH_SUBJECT.title()
            }


        cover_i = doc.get("cover_i")
        cover_url = f"https://covers.openlibrary.org/b/id/{cover_i}-L.jpg" if cover_i else "https://placehold.co/300x450?text=No+Cover"

        books_data.append({
            "bookid": work_id,
            "isbn": isbn,
            "title": title,
            "description": description,
            "publisher": publisher,
            "publishedyear": publishedyear,
            "genreid": genre_id,
            "authorid": author_id,
            "coverimage": cover_url,
            "tags": CUSTOM_TAG
        })
        print(f"Processed book {len(books_data)}: {title}")

        time.sleep(0.2)

    page += 1

def append_to_csv(filename, fieldnames, rows):
    file_exists = os.path.exists(filename)
    with open(filename, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()
        for row in rows:
            writer.writerow(row)


append_to_csv("books.csv", ["bookid","isbn","title","description","publisher",
                            "publishedyear","genreid","authorid","coverimage","tags"], books_data)
append_to_csv("author.csv", ["authorid","name"], [a for a in authors_data.values() if a["authorid"] not in authors_existing])
append_to_csv("genre.csv", ["genreid","genrename"], [g for g in genres_data.values() if g["genreid"] not in genres_existing])

print("CSV files updated with new entries.")