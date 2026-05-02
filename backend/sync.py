import time
import os
import firebase_admin
from firebase_admin import credentials, firestore
from inaturalist import fetch_dog_sightings
from datetime import datetime

# ── Firebase Admin setup ─────────────────────────────────────────
# We use the Firebase Admin SDK here (server-side)
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

COLLECTION = "external_pins"
SYNC_INTERVAL = 600  # 10 minutes in seconds

def sync_inat():
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Fetching iNaturalist sightings...")
    sightings = fetch_dog_sightings(place_id=6681, count=50)

    if not sightings:
        print("No sightings returned.")
        return

    batch = db.batch()
    saved = 0

    for s in sightings:
        doc_ref = db.collection(COLLECTION).document(s["id"])

        # Only save if not already in Firestore
        if not doc_ref.get().exists:
            batch.set(doc_ref, s)
            saved += 1

    batch.commit()
    print(f"✅ Saved {saved} new sightings. ({len(sightings) - saved} already existed)")

def run():
    print("🐕 PawMap iNaturalist sync started...")
    while True:
        sync_inat()
        print(f"⏳ Next sync in {SYNC_INTERVAL // 60} minutes...\n")
        time.sleep(SYNC_INTERVAL)

if __name__ == "__main__":
    run()