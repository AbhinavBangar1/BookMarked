# import requests
# import pandas as pd
# import time
# import re

# BOOKS_PER_AUTHOR = 12

# AUTHOR_IDS = [
#     "OL1394865A","OL272947A","OL30765A","OL250856A","OL2832500A",
#     "OL1401662A","OL7115219A","OL3945898A","OL7051946A","OL25712A",
#     "OL7234434A","OL31906A","OL12751471A","OL26320A","OL7032054A",
#     "OL30522A","OL7400619A","OL25161A","OL2980597A","OL1389873A",
#     "OL23919A","OL24815A","OL234664A","OL34184A","OL2830895A",
#     "OL79034A","OL34221A","OL53305A","OL1604887A","OL31901A",
#     "OL1538986A","OL9777A","OL118077A","OL1412764A","OL28127A",
#     "OL19981A","OL397826A","OL6995566A","OL7614645A","OL3254025A",
#     "OL3030442A","OL18236A","OL7315784A","OL19057A","OL6982995A",
#     "OL7044246A","OL6511535A","OL7370073A","OL237115A","OL236174A",
#     "OL586088A","OL161167A","OL7544043A","OL18319A","OL29774A",
#     "OL1399650A","OL34796A","OL19430A","OL22132A","OL22012A",
#     "OL30421A","OL2703408A","OL2751197A","OL235668A","OL1394359A",
#     "OL28577A","OL28257A","OL4452558A","OL7483937A","OL237257A",
#     "OL29079A","OL27174A","OL7106665A","OL52940A","OL31574A",
#     "OL366346A","OL2801083A","OL182115A","OL2623989A","OL124171A",
#     "OL2630398A","OL6538530A","OL6941868A","OL21594A","OL6788551A",
#     "OL5046634A","OL39486A","OL1295441A","OL10623749A","OL7620131A",
#     "OL22168A","OL24529A","OL7290222A","OL40776A","OL30714A",
#     "OL7399550A","OL884528A","OL22242A","OL2875767A","OL7825177A"
# ]

# existing_genres = {
#     "fiction",
#     "adventure",
#     "action",
#     "romance",
#     "mystery",
#     "thriller",
#     "horror",
#     "wildlife_conservation"
# }

# all_genres = set(existing_genres)

# OPENLIBRARY_AUTHOR_WORKS = "https://openlibrary.org/authors/{author_id}/works.json"
# OPENLIBRARY_WORK = "https://openlibrary.org{work_key}.json"
# OPENLIBRARY_EDITIONS = "https://openlibrary.org{work_key}/editions.json"


# def normalize_genre(text):
#     text = text.lower()
#     text = re.sub(r"[^a-z0-9\s]", "", text)
#     return text.strip().replace(" ", "_")

# def fetch_json(url):
#     try:
#         r = requests.get(url, timeout=10)
#         if r.status_code == 200:
#             return r.json()
#     except:
#         return None
#     return None

# def fetch_author_works(author_id):
#     url = OPENLIBRARY_AUTHOR_WORKS.format(author_id=author_id)
#     data = fetch_json(url)
#     if not data:
#         return []
#     return data.get("entries", [])

# def fetch_work_details(work_key):
#     return fetch_json(OPENLIBRARY_WORK.format(work_key=work_key))

# def fetch_valid_isbn(work_key):
#     """
#     Returns (isbn, publisher, year)
#     Ensures ISBN exists. If not → return None
#     """
#     data = fetch_json(OPENLIBRARY_EDITIONS.format(work_key=work_key))
#     if not data:
#         return None

#     editions = data.get("entries", [])
#     if not editions:
#         return None

#     for edition in editions:
#         isbn = None
#         if "isbn_13" in edition:
#             isbn = edition["isbn_13"][0]
#         elif "isbn_10" in edition:
#             isbn = edition["isbn_10"][0]

#         if isbn: 
#             publisher = edition.get("publishers", [None])[0]
#             publish_date = edition.get("publish_date")

#             year = None
#             if publish_date:
#                 try:
#                     year = int(publish_date[-4:])
#                 except:
#                     pass

#             return isbn, publisher, year

#     return None  

# def choose_genre(subjects):
#     if not subjects:
#         return "fiction"

#     for subject in subjects:
#         norm = normalize_genre(subject)
#         if norm in existing_genres:
#             return norm

#     new_genre = normalize_genre(subjects[0])
#     all_genres.add(new_genre)
#     return new_genre


# def main():
#     books = []
#     seen_books = set()
#     seen_isbn = set()

#     for author_id in AUTHOR_IDS:
#         print(f"\nFetching books for {author_id}")
#         works = fetch_author_works(author_id)
#         count = 0

#         for work in works:
#             if count >= BOOKS_PER_AUTHOR:
#                 break

#             work_key = work.get("key")
#             if not work_key:
#                 continue

#             bookid = work_key.replace("/works/", "")
#             if bookid in seen_books:
#                 continue

#             work_data = fetch_work_details(work_key)
#             if not work_data:
#                 continue

#             edition = fetch_valid_isbn(work_key)

#             if not edition:
#                 continue

#             isbn, publisher, year = edition

#             if isbn in seen_isbn:
#                 continue

#             title = work_data.get("title")
#             if not title:
#                 continue

#             description = None
#             desc = work_data.get("description")
#             if isinstance(desc, dict):
#                 description = desc.get("value")
#             elif isinstance(desc, str):
#                 description = desc

#             subjects = work_data.get("subjects", [])
#             genreid = choose_genre(subjects)
#             tags = ", ".join(subjects[:5]) if subjects else None

#             coverimage = None
#             if "covers" in work_data:
#                 cover_id = work_data["covers"][0]
#                 coverimage = f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg"

#             books.append({
#                 "bookid": bookid,
#                 "isbn": isbn,
#                 "title": title,
#                 "description": description,
#                 "publisher": publisher,
#                 "publishedyear": year,
#                 "genreid": genreid,
#                 "authorid": author_id,
#                 "coverimage": coverimage,
#                 "tags": tags
#             })

#             seen_books.add(bookid)
#             seen_isbn.add(isbn)
#             print(f"Collected: {bookid} (ISBN: {isbn})")

#             count += 1
#             time.sleep(0.3)

#         print(f"Collected {count} valid books")

#     # EXPORT FILES
#     pd.DataFrame(books).to_csv("authorbooks.csv", index=False)

#     genre_rows = [
#         {"genreid": g, "genrename": g.replace("_", " ").title()}
#         for g in all_genres
#     ]
#     pd.DataFrame(genre_rows).to_csv("genres.csv", index=False)

#     print("\nDONE")
#     print(f"Total Books: {len(books)}")
#     print(f"Total Genres: {len(all_genres)}")
#     print("Created: books.csv and genres.csv")

# if __name__ == "__main__":
#     main()




import requests
import pandas as pd
import time
import re

# ==========================================
# CONFIG
# ==========================================

BOOKS_PER_AUTHOR = 12

AUTHOR_IDS = [
    "OL1394865A","OL272947A","OL30765A","OL250856A","OL2832500A",
    "OL1401662A","OL7115219A","OL3945898A","OL7051946A","OL25712A",
    "OL7234434A","OL31906A","OL12751471A","OL26320A","OL7032054A",
    "OL30522A","OL7400619A","OL25161A","OL2980597A","OL1389873A",
    "OL23919A","OL24815A","OL234664A","OL34184A","OL2830895A",
    "OL79034A","OL34221A","OL53305A","OL1604887A","OL31901A",
    "OL1538986A","OL9777A","OL118077A","OL1412764A","OL28127A",
    "OL19981A","OL397826A","OL6995566A","OL7614645A","OL3254025A",
    "OL3030442A","OL18236A","OL7315784A","OL19057A","OL6982995A",
    "OL7044246A","OL6511535A","OL7370073A","OL237115A","OL236174A",
    "OL586088A","OL161167A","OL7544043A","OL18319A","OL29774A",
    "OL1399650A","OL34796A","OL19430A","OL22132A","OL22012A",
    "OL30421A","OL2703408A","OL2751197A","OL235668A","OL1394359A",
    "OL28577A","OL28257A","OL4452558A","OL7483937A","OL237257A",
    "OL29079A","OL27174A","OL7106665A","OL52940A","OL31574A",
    "OL366346A","OL2801083A","OL182115A","OL2623989A","OL124171A",
    "OL2630398A","OL6538530A","OL6941868A","OL21594A","OL6788551A",
    "OL5046634A","OL39486A","OL1295441A","OL10623749A","OL7620131A",
    "OL22168A","OL24529A","OL7290222A","OL40776A","OL30714A",
    "OL7399550A","OL884528A","OL22242A","OL2875767A","OL7825177A"
]

# Your existing genres
existing_genres = {
    "fiction",
    "adventure",
    "action",
    "romance",
    "mystery",
    "thriller",
    "horror",
    "wildlife_conservation"
}

all_genres = set(existing_genres)

# ==========================================
# OPENLIBRARY URLS
# ==========================================

AUTHOR_WORKS_URL = "https://openlibrary.org/authors/{}/works.json?page={}"
WORK_DETAILS_URL = "https://openlibrary.org{}.json"
WORK_EDITIONS_URL = "https://openlibrary.org{}/editions.json"

# ==========================================
# HELPERS
# ==========================================

def fetch_json(url):
    try:
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            return r.json()
    except:
        return None
    return None

def normalize_genre(text):
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", "", text)
    return text.strip().replace(" ", "_")

def choose_genre(subjects):
    if not subjects:
        return "fiction"

    for subject in subjects:
        norm = normalize_genre(subject)
        if norm in existing_genres:
            return norm

    new_genre = normalize_genre(subjects[0])
    all_genres.add(new_genre)
    return new_genre

def fetch_valid_isbn(work_key):
    """
    Returns (isbn, publisher, year)
    Only returns if ISBN exists.
    """
    data = fetch_json(WORK_EDITIONS_URL.format(work_key))
    if not data:
        return None

    editions = data.get("entries", [])
    if not editions:
        return None

    for edition in editions:
        isbn = None

        if "isbn_13" in edition:
            isbn = edition["isbn_13"][0]
        elif "isbn_10" in edition:
            isbn = edition["isbn_10"][0]

        if isbn:
            publisher = edition.get("publishers", [None])[0]
            publish_date = edition.get("publish_date")

            year = None
            if publish_date:
                try:
                    year = int(publish_date[-4:])
                except:
                    pass

            return isbn, publisher, year

    return None  # no ISBN found

def get_12_valid_books(author_id, seen_books, seen_isbn):
    collected = []
    page = 1

    while len(collected) < BOOKS_PER_AUTHOR:
        data = fetch_json(AUTHOR_WORKS_URL.format(author_id, page))
        if not data:
            break

        works = data.get("entries", [])
        if not works:
            break

        for work in works:
            if len(collected) >= BOOKS_PER_AUTHOR:
                break

            work_key = work.get("key")
            if not work_key:
                continue

            bookid = work_key.replace("/works/", "")
            if bookid in seen_books:
                continue

            work_data = fetch_json(WORK_DETAILS_URL.format(work_key))
            if not work_data:
                continue

            edition = fetch_valid_isbn(work_key)
            if not edition:
                continue  # 🚨 skip if no ISBN

            isbn, publisher, year = edition

            if isbn in seen_isbn:
                continue

            title = work_data.get("title")
            if not title:
                continue

            description = None
            desc = work_data.get("description")
            if isinstance(desc, dict):
                description = desc.get("value")
            elif isinstance(desc, str):
                description = desc

            subjects = work_data.get("subjects", [])
            genreid = choose_genre(subjects)
            tags = ", ".join(subjects[:5]) if subjects else None

            coverimage = None
            if "covers" in work_data:
                cover_id = work_data["covers"][0]
                coverimage = f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg"

            collected.append({
                "bookid": bookid,
                "isbn": isbn,
                "title": title,
                "description": description,
                "publisher": publisher,
                "publishedyear": year,
                "genreid": genreid,
                "authorid": author_id,
                "coverimage": coverimage,
                "tags": tags
            })

            seen_books.add(bookid)
            seen_isbn.add(isbn)

            time.sleep(0.3)

        page += 1

    return collected

# ==========================================
# MAIN
# ==========================================

def main():
    books = []
    seen_books = set()
    seen_isbn = set()

    for author_id in AUTHOR_IDS:
        print(f"\nProcessing {author_id}...")

        author_books = get_12_valid_books(author_id, seen_books, seen_isbn)
        books.extend(author_books)

        print(f"Collected {len(author_books)} valid books")

    # Export books
    pd.DataFrame(books).to_csv("authorbooks.csv", index=False)

    # Export genres
    genre_rows = [
        {"genreid": g, "genrename": g.replace("_", " ").title()}
        for g in all_genres
    ]
    pd.DataFrame(genre_rows).to_csv("genres.csv", index=False)

    print("\n===================================")
    print("DONE")
    print(f"Total Books: {len(books)}")
    print(f"Total Genres: {len(all_genres)}")
    print("Created files:")
    print(" - books.csv")
    print(" - genres.csv")
    print("===================================")


if __name__ == "__main__":
    main()