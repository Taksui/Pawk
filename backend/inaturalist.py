import requests
from datetime import datetime

INAT_API = "https://api.inaturalist.org/v1/observations"

def fetch_dog_sightings(place_id=6681, count=50):
    """
    Fetch recent dog observations from iNaturalist.
    place_id 6681 = India
    place_id 97562 = worldwide (no filter)
    """
    try:
        response = requests.get(INAT_API, params={
            "taxon_name": "Canis lupus familiaris",
            "per_page": count,
            "order": "desc",
            "order_by": "created_at",
            "place_id": place_id,
            "has[]": "geo",          # only observations WITH coordinates
            "quality_grade": "any",  # include casual + research grade
        }, timeout=10)

        response.raise_for_status()
        data = response.json()

        sightings = []
        for obs in data.get("results", []):
            # Skip if no location
            if not obs.get("location"):
                continue

            lat, lng = obs["location"].split(",")

            sightings.append({
                "id": f"inat_{obs['id']}",
                "lat": float(lat),
                "lng": float(lng),
                "source": "iNaturalist",
                "sourceUrl": f"https://www.inaturalist.org/observations/{obs['id']}",
                "imageUrl": (
                    obs["photos"][0]["url"].replace("square", "medium")
                    if obs.get("photos") else None
                ),
                "notes": obs.get("description") or "Dog observed via iNaturalist",
                "userName": obs.get("user", {}).get("login", "iNaturalist User"),
                "userAvatar": obs.get("user", {}).get("icon_url", None),
                "qualityGrade": obs.get("quality_grade", "casual"),
                "createdAt": obs.get("created_at", datetime.utcnow().isoformat()),
                "isExternal": True,
            })

        return sightings

    except Exception as e:
        print(f"iNaturalist fetch error: {e}")
        return []