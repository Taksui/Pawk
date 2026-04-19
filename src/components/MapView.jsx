import { useState } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";

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

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  function handleMapClick(event) {
    const newPin = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
      id: Date.now(),
    };
    setPins((existing) => [...existing, newPin]);
    onPinAdded();
  }

  if (loadError) return <p>Error loading map 😥</p>;
  if (!isLoaded) return <p>Loading map... 🐾</p>;

  return (
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
        />
      ))}
    </GoogleMap>
  );
}

export default MapView;