import "../styles/PinInfoCard.css";

function PinInfoCard({ pin, onClose }) {
  const date = new Date(pin.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  function SourceBadge() {
    if (pin.source === "Reddit") {
      return (
        <span className="source-badge source-reddit">
          🔴 r/{pin.subreddit || "reddit"}
        </span>
      );
    }
    if (pin.source === "iNaturalist") {
      return (
        <span className="source-badge source-inaturalist">
          🟣 iNaturalist
        </span>
      );
    }
    return (
      <span className="source-badge source-user">
        🟡 User Report
      </span>
    );
  }

  return (
    <div className="card-overlay">
      <div className="info-card">

        <button className="close-btn" onClick={onClose}>✕</button>

        {pin.imageUrl ? (
          <div className="card-img-gradient">
            <img src={pin.imageUrl} alt="Dog sighting" className="card-img" />
          </div>
        ) : (
          <div className="no-image">No photo for this sighting</div>
        )}

        <div className="card-body">
          <h3>🐾 Dog Sighting</h3>

          <SourceBadge />

          {pin.notes
            ? <p className="card-notes">{pin.notes}</p>
            : <p className="card-notes muted">No notes added.</p>
          }

          {pin.sourceUrl && (
            <a
              href={pin.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="source-link"
            >
              View original post ↗
            </a>
          )}

          {pin.isNewDog === false && pin.matchedPinId && (
            <div className="card-match">
              🔁 Previously spotted · {pin.similarity}% match
            </div>
          )}

          {pin.isNewDog === true && (
            <div className="card-new">
              🆕 First time spotting this dog
            </div>
          )}

          <div className="card-meta">
            <span className="card-date">📅 {date}</span>
            <span className="card-coords">
              📍 {Number(pin.lat).toFixed(4)}, {Number(pin.lng).toFixed(4)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PinInfoCard;