import { useState } from "react";
import MapView from "./components/MapView";
import LoginScreen from "./components/LoginScreen";
import ProfilePanel from "./components/ProfilePanel";
import { useAuth } from "./hooks/useAuth";
import "./styles/App.css";

function App() {
  const [pinCount, setPinCount] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#07070f",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "rgba(255,255,255,0.3)",
      fontFamily: "DM Sans, sans-serif",
      fontSize: "0.9rem",
    }}>
      Loading...
    </div>
  );

  if (!user) return <LoginScreen />;

  return (
    <div>
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">🐾</div>
          <h1>Pawk</h1>
        </div>

        <div className="header-right">
          <div className="counter-pill">
            <span className="counter-dot" />
            {pinCount} sightings
          </div>
          <span className="status-badge">AI Active</span>
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="avatar-btn"
            onClick={() => setShowProfile(true)}
            title="View profile"
          />
        </div>
      </header>

      <MapView
        onPinAdded={(count) => setPinCount(count)}
        user={user}
      />

      {showProfile && (
        <ProfilePanel
          user={user}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}

export default App;