import { useState, useEffect, useRef } from "react";
import { GoogleMap, useLoadScript, Marker, HeatmapLayer } from "@react-google-maps/api";
import { collection, addDoc, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { uploadImageToCloudinary } from "../services/cloudinary";
import { matchDog } from "../services/dogRecognition";
import { fetchRedditSightings } from "../services/redditSightings";
import PinPopup from "./PinPopup";
import PinInfoCard from "./PinInfoCard";
import mapStyle from "../assets/mapStyle.json";
import "../styles/MapView.css";

// ── Constants ─────────────────────────────────────────────────────
const LIBRARIES = ["visualization"];

const MAP_CONTAINER = { width: "100vw", height: "100vh" };

// Default to Hyderabad for better demo impact
const DEFAULT_CENTER = { lat: 17.3850, lng: 78.4867 };
const DEFAULT_ZOOM   = 12;

const MAP_OPTIONS = {
  styles:             mapStyle,
  disableDefaultUI:   false,
  zoomControl:        true,
  zoomControlOptions: { position: 7 }, // LEFT_BOTTOM — away from our panel
  streetViewControl:  false,
  mapTypeControl:     false,
  fullscreenControl:  false,
  gestureHandling:    "greedy",
  minZoom: 4,
};

// Warm heatmap gradient — readable on dark map, not overpowering
const HEATMAP_GRADIENT = [
  "rgba(0,0,0,0)",
  "rgba(245,158,11,0.3)",
  "rgba(245,158,11,0.7)",
  "rgba(251,146,60,0.85)",
  "rgba(239,68,68,0.9)",
  "rgba(220,38,38,1)",
];

// Sample pins shown when Firestore is empty — makes the demo feel alive
const SAMPLE_PINS = [
  { id: "sample_1", lat: 17.3920, lng: 78.4980, source: "User", notes: "Friendly dog near Banjara Hills", imageUrl: null, createdAt: new Date().toISOString(), isSample: true },
  { id: "sample_2", lat: 17.3750, lng: 78.4750, source: "User", notes: "Injured pup near Jubilee Hills", imageUrl: null, createdAt: new Date().toISOString(), isSample: true },
  { id: "sample_3", lat: 17.4100, lng: 78.5100, source: "User", notes: "Pack of 4 near Secunderabad", imageUrl: null, createdAt: new Date().toISOString(), isSample: true },
  { id: "sample_4", lat: 17.3600, lng: 78.4600, source: "User", notes: "Street dog near Madhapur", imageUrl: null, createdAt: new Date().toISOString(), isSample: true },
];

// ── Marker icon builders ──────────────────────────────────────────
function userIcon(google) {
  return {
    path:        google.maps.SymbolPath.CIRCLE,
    scale:       8,
    fillColor:   "#f59e0b",
    fillOpacity: 0.92,
    strokeColor: "rgba(245,158,11,0.28)",
    strokeWeight: 6,
  };
}

function sampleIcon(google) {
  return {
    path:        google.maps.SymbolPath.CIRCLE,
    scale:       7,
    fillColor:   "#f59e0b",
    fillOpacity: 0.45,
    strokeColor: "rgba(245,158,11,0.15)",
    strokeWeight: 5,
  };
}

function inatIcon(google) {
  return {
    path:        google.maps.SymbolPath.CIRCLE,
    scale:       7,
    fillColor:   "#a78bfa",
    fillOpacity: 0.88,
    strokeColor: "rgba(167,139,250,0.25)",
    strokeWeight: 5,
  };
}

function redditIcon(google) {
  return {
    path:        google.maps.SymbolPath.CIRCLE,
    scale:       7,
    fillColor:   "#fb923c",
    fillOpacity: 0.88,
    strokeColor: "rgba(251,146,60,0.25)",
    strokeWeight: 5,
  };
}

// ── Component ─────────────────────────────────────────────────────
function MapView({ onPinAdded, user }) {
  const [pins, setPins]                     = useState([]);
  const [externalPins, setExternalPins]     = useState([]);
  const [redditPins, setRedditPins]         = useState([]);
  const [displayPins, setDisplayPins]       = useState(SAMPLE_PINS);
  const [pendingLocation, setPendingLocation] = useState(null);
  const [selectedPin, setSelectedPin]       = useState(null);
  const [showHeatmap, setShowHeatmap]       = useState(false);
  const [heatmapData, setHeatmapData]       = useState([]);
  const [showHint, setShowHint]             = useState(true);
  const redditFetched                       = useRef(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  // 🔥 Firestore — user pins
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "pins"), (snap) => {
      const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPins(loaded);
      onPinAdded(loaded.length);
    });
    return () => unsub();
  }, []);

  // 🌍 Firestore — iNaturalist external pins
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "external_pins"), (snap) => {
      const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setExternalPins(loaded);
    });
    return () => unsub();
  }, []);

  // 🔴 Reddit — fetch once on mount, no auth needed
  useEffect(() => {
    if (redditFetched.current) return;
    redditFetched.current = true;

    fetchRedditSightings().then((results) => {
      setRedditPins(results);
    });
  }, []);

  // Decide whether to show sample pins or real pins
  useEffect(() => {
    if (pins.length > 0) {
      setDisplayPins([]); // real data present — hide samples
    } else {
      setDisplayPins(SAMPLE_PINS);
    }
  }, [pins]);

  // 🌡️ Build heatmap from all sources
  useEffect(() => {
    if (!isLoaded) return;
    const all = [...pins, ...externalPins, ...redditPins, ...displayPins];
    if (all.length === 0) return;

    const points = all.map((pin) => ({
      location: new window.google.maps.LatLng(pin.lat, pin.lng),
      weight:   pin.isSample ? 0.4 : pin.isExternal ? 0.65 : 1,
    }));
    setHeatmapData(points);
  }, [pins, externalPins, redditPins, displayPins, isLoaded]);

  // 📍 Map click
  function handleMapClick(event) {
    setShowHint(false);
    setPendingLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
  }

  function handleMarkerClick(pin) {
    setSelectedPin(pin);
  }

  // 💾 Save to Firestore + Cloudinary + recognition
  async function handleSave(imageFile, notes) {
    let imageUrl = null;
    if (imageFile) imageUrl = await uploadImageToCloudinary(imageFile);

    const docRef = await addDoc(collection(db, "pins"), {
      lat:          pendingLocation.lat,
      lng:          pendingLocation.lng,
      imageUrl,
      notes,
      createdAt:    new Date().toISOString(),
      matchedPinId: null,
      userId:       user?.uid   || "anonymous",
      userName:     user?.displayName || "Anonymous",
    });

    if (imageFile) {
      const rec = await matchDog(imageFile, docRef.id);
      await updateDoc(doc(db, "pins", docRef.id), {
        matchedPinId: rec.matched_pin_id,
        similarity:   rec.similarity,
        isNewDog:     !rec.is_match,
      });
    }

    setPendingLocation(null);
  }

  function handleCancel() {
    setPendingLocation(null);
  }

  // Stats
  const totalPins    = pins.length + externalPins.length + redditPins.length;
  const activityPct  = Math.min(100, totalPins * 3);
  const inatCount    = externalPins.filter((p) => p.source === "iNaturalist").length;
  const redditCount  = redditPins.length;

  if (loadError) return (
    <div style={{ color: "rgba(255,255,250,0.5)", padding: 40, fontFamily: "DM Sans,sans-serif" }}>
      Map failed to load.
    </div>
  );

  if (!isLoaded) return (
    <div style={{
      position: "fixed", inset: 0, background: "#0e0e16",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "rgba(255,255,250,0.3)", fontFamily: "DM Sans,sans-serif", fontSize: "0.88rem",
    }}>
      Loading map...
    </div>
  );

  const G = window.google;

  return (
    <>
      {/* ── Map ───────────────────────────────────────────────── */}
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER}
        zoom={DEFAULT_ZOOM}
        center={DEFAULT_CENTER}
        options={MAP_OPTIONS}
        onClick={handleMapClick}
      >
        {/* Sample pins (faded) — shown only when no real data */}
        {displayPins.map((pin) => (
          <Marker
            key={pin.id}
            position={{ lat: pin.lat, lng: pin.lng }}
            onClick={() => handleMarkerClick(pin)}
            icon={sampleIcon(G)}
            animation={G.maps.Animation.DROP}
          />
        ))}

        {/* User pins */}
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={{ lat: pin.lat, lng: pin.lng }}
            onClick={() => handleMarkerClick(pin)}
            icon={userIcon(G)}
            animation={G.maps.Animation.DROP}
          />
        ))}

        {/* iNaturalist pins */}
        {externalPins.map((pin) => (
          <Marker
            key={pin.id}
            position={{ lat: pin.lat, lng: pin.lng }}
            onClick={() => handleMarkerClick(pin)}
            icon={inatIcon(G)}
          />
        ))}

        {/* Reddit pins */}
        {redditPins.map((pin) => (
          <Marker
            key={pin.id}
            position={{ lat: pin.lat, lng: pin.lng }}
            onClick={() => handleMarkerClick(pin)}
            icon={redditIcon(G)}
          />
        ))}

        {/* Heatmap */}
        {showHeatmap && heatmapData.length > 0 && (
          <HeatmapLayer
            data={heatmapData}
            options={{
              radius:   35,
              opacity:  0.65,
              gradient: HEATMAP_GRADIENT,
            }}
          />
        )}
      </GoogleMap>

      {/* ── Left Stats Panel ─────────────────────────────────── */}
      <div className="stats-panel">
        <span className="panel-label">Live Overview</span>

        <div className="stat-row">
          <span className="stat-value">{totalPins || displayPins.length}</span>
          <span className="stat-label">Total sightings</span>
        </div>

        <div className="activity-bar">
          <div className="activity-fill" style={{ width: `${activityPct || 30}%` }} />
        </div>

        <div className="divider" />

        <div className="hot-zone-row">
          <span className="hot-zone-label">🟡 User reports</span>
          <span className="hot-zone-badge">{pins.length}</span>
        </div>
        <div className="hot-zone-row">
          <span className="hot-zone-label">🟣 iNaturalist</span>
          <span className="hot-zone-badge">{inatCount}</span>
        </div>
        <div className="hot-zone-row">
          <span className="hot-zone-label">🟠 Reddit</span>
          <span className="hot-zone-badge">{redditCount}</span>
        </div>
      </div>

      {/* ── Bottom-Right Control Panel ───────────────────────── */}
      <div className="control-panel">
        <span className="hint-text">
          {showHeatmap ? "High activity zones" : "Click map to report"}
        </span>
        <button
          className={`heatmap-toggle ${showHeatmap ? "active" : ""}`}
          onClick={() => setShowHeatmap((p) => !p)}
        >
          <span className={`toggle-icon ${showHeatmap ? "on" : "off"}`} />
          {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
        </button>
      </div>

      {/* ── Map Hint ─────────────────────────────────────────── */}
      {showHint && (
        <div className="map-hint">
          📍 Click anywhere on the map to report a sighting
        </div>
      )}

      {/* ── Popups ───────────────────────────────────────────── */}
      {pendingLocation && (
        <PinPopup onSave={handleSave} onCancel={handleCancel} />
      )}
      {selectedPin && (
        <PinInfoCard pin={selectedPin} onClose={() => setSelectedPin(null)} />
      )}
    </>
  );
}

export default MapView;