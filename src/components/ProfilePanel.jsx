import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../services/firebase";
import { logOut } from "../services/authService";
import "../styles/ProfilePanel.css";

function ProfilePanel({ user, onClose }) {
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "pins"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSightings(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  async function handleLogout() {
    await logOut();
    onClose();
  }

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-panel" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="profile-header">
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="profile-avatar"
          />
          <div className="profile-info">
            <h2 className="profile-name">{user.displayName}</h2>
            <p className="profile-email">{user.email}</p>
          </div>
          <button className="profile-close" onClick={onClose}>✕</button>
        </div>

        {/* ── Stats ── */}
        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-num">{sightings.length}</span>
            <span className="stat-lbl">Sightings</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">
              {sightings.filter((s) => s.imageUrl).length}
            </span>
            <span className="stat-lbl">With Photos</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">
              {sightings.filter((s) => s.isNewDog).length}
            </span>
            <span className="stat-lbl">New Dogs</span>
          </div>
        </div>

        {/* ── Sightings List ── */}
        <div className="profile-section-label">My Sightings</div>

        <div className="sightings-list">
          {loading && (
            <p className="profile-empty">Loading your sightings...</p>
          )}

          {!loading && sightings.length === 0 && (
            <p className="profile-empty">
              No sightings yet — tap the map to add one! 🐾
            </p>
          )}

          {sightings.map((s) => (
            <div className="sighting-item" key={s.id}>
              {s.imageUrl ? (
                <img
                  src={s.imageUrl}
                  alt="Dog"
                  className="sighting-thumb"
                />
              ) : (
                <div className="sighting-thumb-empty">🐶</div>
              )}
              <div className="sighting-details">
                <p className="sighting-notes">
                  {s.notes || "No notes added"}
                </p>
                <p className="sighting-date">
                  {new Date(s.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                {s.isNewDog && (
                  <span className="sighting-badge new">🆕 New dog</span>
                )}
                {s.isNewDog === false && (
                  <span className="sighting-badge seen">🔁 Seen before</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Logout ── */}
        <button className="logout-btn" onClick={handleLogout}>
          Sign out
        </button>

      </div>
    </div>
  );
}

export default ProfilePanel;