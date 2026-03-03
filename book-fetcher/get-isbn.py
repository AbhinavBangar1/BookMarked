import requests
import time

# 🔥 PUT ALL YOUR BOOK IDS HERE
book_ids = [
    "OL16813053W",
    "OL2163649W",
    "OL17054790W",
    "OL15358691W",
    "OL2056818W",
    "OL17812914W",
    "OL1495436W",
    # 👉 Add the rest of your book IDs here
]

def get_isbn(work_id):
    url = f"https://openlibrary.org/works/{work_id}/editions.json?limit=10"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return None

        data = response.json()
        entries = data.get("entries", [])

        for edition in entries:
            # Prefer ISBN-13
            if "isbn_13" in edition and edition["isbn_13"]:
                return edition["isbn_13"][0]

            # Fallback to ISBN-10
            if "isbn_10" in edition and edition["isbn_10"]:
                return edition["isbn_10"][0]

        return None

    except Exception:
        return None


print("-- Generated SQL Updates")
print("-- Paste this into Supabase SQL editor\n")

for book_id in book_ids:
    isbn = get_isbn(book_id)

    if isbn:
        print(f"UPDATE books SET isbn = '{isbn}' WHERE bookid = '{book_id}';")
    else:
        print(f"-- No ISBN found for {book_id}")

    # Avoid rate limiting
    time.sleep(1)