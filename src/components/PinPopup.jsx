import { useState } from "react";
import "../styles/PinPopup.css";

function PinPopup({ onSave, onCancel }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  async function handleSave() {
    setUploading(true);
    await onSave(image, notes);
    setUploading(false);
  }

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h2>🐶 Dog Sighting</h2>
        <p>Add details about this sighting</p>

        <textarea
          placeholder="Notes (e.g. injured, friendly, near temple...)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="notes-input"
          rows={3}
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="preview-img"
          />
        )}

        <div className="popup-buttons">
          <button onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-save"
            disabled={uploading}
          >
            {uploading ? "Saving... 🐾" : "Save Sighting ✅"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PinPopup;