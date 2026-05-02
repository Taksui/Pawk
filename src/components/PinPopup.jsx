import { useState } from "react";
import { detectDog } from "../services/dogDetection";
import "../styles/PinPopup.css";

function PinPopup({ onSave, onCancel }) {
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [notes, setNotes]       = useState("");
  const [uploading, setUploading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [checking, setChecking] = useState(false);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setAiResult(null);
    }
  }

  async function handleCheckImage() {
    if (!image) return;
    setChecking(true);
    const result = await detectDog(image);
    setAiResult(result);
    setChecking(false);
  }

  async function handleSave() {
    setUploading(true);
    await onSave(image, notes);
    setUploading(false);
  }

  return (
    <div className="popup-overlay">
      <div className="popup-box">

        <div className="popup-header">
          <h2>🐶 Dog Sighting</h2>
          <p className="popup-sub">Mark a new sighting on the map</p>
        </div>

        <textarea
          className="notes-input"
          placeholder="Notes — injured, friendly, near temple..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        <label className="file-label">
          📷&nbsp; {image ? image.name : "Upload a photo (optional)"}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>

        {preview && (
          <img src={preview} alt="Preview" className="preview-img" />
        )}

        {image && !aiResult && (
          <button
            className="btn-check"
            onClick={handleCheckImage}
            disabled={checking}
          >
            {checking ? "Analyzing dog... 🧠🐶" : "🔍 Verify with AI"}
          </button>
        )}

        {aiResult && (
          <div className={`ai-result ${aiResult.is_dog ? "success" : "fail"}`}>
            {aiResult.is_dog
              ? <>✅ Dog detected — <strong>{aiResult.label}</strong> ({aiResult.confidence}% confidence)</>
              : <>❌ No dog detected in this image</>
            }
          </div>
        )}

        <div className="popup-buttons">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-save" onClick={handleSave} disabled={uploading}>
            {uploading ? "Saving... 🐾" : "Save Sighting"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default PinPopup;