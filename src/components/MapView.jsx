import { useState, useEffect } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { uploadImageToCloudinary } from "../services/cloudinary";
import PinPopup from "./PinPopup";
import PinInfoCard from "./PinInfoCard";

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};

const center = {
  lat: 20.5937,
  lng: 78.9629,
};

function MapView({ onPinAdded }) {
  const [pins, setPins] = useState([]);
  const [pendingLocation, setPendingLocation] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  // 🔥 Load pins from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "pins"), (snapshot) => {
      const loadedPins = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPins(loadedPins);
      onPinAdded(loadedPins.length);
    });

    return () => unsubscribe();
  }, []);

  // 📍 Map click → open add popup
  function handleMapClick(event) {
    setPendingLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
  }

  // 🐶 Pin click → open info card
  function handleMarkerClick(pin) {
    setSelectedPin(pin);
  }

  // ☁️ Upload to Cloudinary, save to Firestore
  async function handleSave(imageFile, notes) {
    let imageUrl = null;

    if (imageFile) {
      imageUrl = await uploadImageToCloudinary(imageFile);
    }

    await addDoc(collection(db, "pins"), {
      lat: pendingLocation.lat,
      lng: pendingLocation.lng,
      imageUrl: imageUrl,
      notes: notes,
      createdAt: new Date().toISOString(),
    });

    setPendingLocation(null);
  }

  function handleCancel() {
    setPendingLocation(null);
  }

  if (loadError) return <p>Error loading map 😥</p>;
  if (!isLoaded) return <p>Loading map... 🐾</p>;

  return (
    <>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={5}
        center={center}
        onClick={handleMapClick}
      >
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={{ lat: pin.lat, lng: pin.lng }}
            onClick={() => handleMarkerClick(pin)}
          />
        ))}
      </GoogleMap>

      {pendingLocation && (
        <PinPopup onSave={handleSave} onCancel={handleCancel} />
      )}

      {selectedPin && (
        <PinInfoCard
          pin={selectedPin}
          onClose={() => setSelectedPin(null)}
        />
      )}
    </>
  );
}

export default MapView;