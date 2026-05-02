/**
 * redditSightings.js
 * Fetches dog-related posts from Reddit's public JSON endpoints.
 * No API key required — uses the public ?format=json trick.
 */

const SUBREDDITS = [
  { name: "hyderabad",   city: "Hyderabad",   lat: 17.3850, lng: 78.4867 },
  { name: "bangalore",   city: "Bengaluru",   lat: 12.9716, lng: 77.5946 },
  { name: "chennai",     city: "Chennai",     lat: 13.0827, lng: 80.2707 },
  { name: "mumbai",      city: "Mumbai",      lat: 19.0760, lng: 72.8777 },
  { name: "delhi",       city: "Delhi",       lat: 28.6139, lng: 77.2090 },
  { name: "pune",        city: "Pune",        lat: 18.5204, lng: 73.8567 },
  { name: "kolkata",     city: "Kolkata",     lat: 22.5726, lng: 88.3639 },
  { name: "india",       city: null,          lat: null,    lng: null     },
  { name: "streetdogs",  city: null,          lat: null,    lng: null     },
  { name: "animalrescue",city: null,          lat: null,    lng: null     },
];

const DOG_KEYWORDS = [
  "street dog", "stray dog", "indie dog", "desi dog",
  "dog rescue", "injured dog", "abandoned dog", "dog found",
  "puppy found", "stray puppy", "street puppy", "dog sighting",
  "dog bite", "dog attack", "feeding dog", "rescued dog",
];

const CITY_COORDS = {
  hyderabad:      { lat: 17.3850, lng: 78.4867 },
  bangalore:      { lat: 12.9716, lng: 77.5946 },
  bengaluru:      { lat: 12.9716, lng: 77.5946 },
  chennai:        { lat: 13.0827, lng: 80.2707 },
  mumbai:         { lat: 19.0760, lng: 72.8777 },
  delhi:          { lat: 28.6139, lng: 77.2090 },
  pune:           { lat: 18.5204, lng: 73.8567 },
  kolkata:        { lat: 22.5726, lng: 88.3639 },
  ahmedabad:      { lat: 23.0225, lng: 72.5714 },
  jaipur:         { lat: 26.9124, lng: 75.7873 },
  kochi:          { lat:  9.9312, lng: 76.2673 },
  chandigarh:     { lat: 30.7333, lng: 76.7794 },
  noida:          { lat: 28.5355, lng: 77.3910 },
  gurgaon:        { lat: 28.4595, lng: 77.0266 },
  gurugram:       { lat: 28.4595, lng: 77.0266 },
  coimbatore:     { lat: 11.0168, lng: 76.9558 },
  lucknow:        { lat: 26.8467, lng: 80.9462 },
  nagpur:         { lat: 21.1458, lng: 79.0882 },
  bhopal:         { lat: 23.2599, lng: 77.4126 },
  visakhapatnam:  { lat: 17.6868, lng: 83.2185 },
  mysore:         { lat: 12.2958, lng: 76.6394 },
  mysuru:         { lat: 12.2958, lng: 76.6394 },
};

function isRelevant(title = "", body = "") {
  const text = (title + " " + body).toLowerCase();
  return DOG_KEYWORDS.some((kw) => text.includes(kw));
}

function extractCity(title = "", body = "") {
  const text = (title + " " + body).toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (text.includes(city)) return { city, ...coords };
  }
  return null;
}

function jitter(val, amount = 0.04) {
  return val + (Math.random() - 0.5) * amount * 2;
}

async function fetchSubreddit(sub) {
  const url = `https://www.reddit.com/r/${sub.name}/search.json?q=dog+stray+street&restrict_sr=1&sort=new&limit=25&t=month`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "pawmap-app/1.0" },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.children || [];
  } catch {
    return [];
  }
}

export async function fetchRedditSightings() {
  const results = [];
  const seenIds = new Set();

  for (const sub of SUBREDDITS) {
    const posts = await fetchSubreddit(sub);

    for (const { data: post } of posts) {
      if (seenIds.has(post.id)) continue;
      seenIds.add(post.id);

      if (!isRelevant(post.title, post.selftext)) continue;

      // Try to extract city from post text first
      const cityMatch = extractCity(post.title, post.selftext);

      // Fall back to subreddit's hardcoded city
      let lat, lng, city;
      if (cityMatch) {
        lat  = jitter(cityMatch.lat);
        lng  = jitter(cityMatch.lng);
        city = cityMatch.city;
      } else if (sub.lat) {
        lat  = jitter(sub.lat);
        lng  = jitter(sub.lng);
        city = sub.city;
      } else {
        continue; // can't place it, skip
      }

      // Extract image if available
      let imageUrl = null;
      if (post.url?.match(/\.(jpg|jpeg|png|webp)(\?.*)?$/i)) {
        imageUrl = post.url;
      } else if (post.preview?.images?.[0]?.source?.url) {
        imageUrl = post.preview.images[0].source.url.replace(/&amp;/g, "&");
      }

      results.push({
        id:         `reddit_${post.id}`,
        lat,
        lng,
        source:     "Reddit",
        subreddit:  sub.name,
        city,
        notes:      post.title,
        sourceUrl:  `https://reddit.com${post.permalink}`,
        imageUrl,
        userName:   post.author || "Reddit User",
        userAvatar: null,
        upvotes:    post.score || 0,
        createdAt:  new Date(post.created_utc * 1000).toISOString(),
        isExternal: true,
      });
    }

    // Small delay between subreddits — be polite
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`Reddit: fetched ${results.length} dog-related posts`);
  return results;
}