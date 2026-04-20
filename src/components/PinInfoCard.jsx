import "../styles/PinInfoCard.css";

function PinInfoCard({ pin, onClose }) {
  const date = new Date(pin.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="card-overlay">
      <div className="info-card">
        <button className="close-btn" onClick={onClose}>✕</button>

        {pin.imageUrl ? (
          <img src={pin.imageUrl} alt="Dog sighting" className="card-img" />
        ) : (
          <div className="no-image">🐶 No photo uploaded</div>
        )}

        <div className="card-body">
          <h3>🐾 Dog Sighting</h3>

          {pin.notes ? (
            <p className="card-notes">{pin.notes}</p>
          ) : (
            <p className="card-notes muted">No notes added.</p>
          )}

          <p className="card-date">📅 Spotted on {date}</p>
          <p className="card-coords">
            📍 {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PinInfoCard;