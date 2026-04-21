import { useState } from "react";
import { detectDog } from "../services/dogDetection";
import "../styles/PinPopup.css";

function PinPopup({ onSave, onCancel }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [checking, setChecking] = useState(false);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setAiResult(null); // reset result on new image
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
          <img src={preview} alt="Preview" className="preview-img" />
        )}

        {/* AI Check Button */}
        {image && !aiResult && (
          <button
            onClick={handleCheckImage}
            className="btn-check"
            disabled={checking}
          >
            {checking ? "Checking with AI... 🤖" : "🔍 Check if it's a dog"}
          </button>
        )}

        {/* AI Result */}
        {aiResult && (
          <div className={`ai-result ${aiResult.is_dog ? "success" : "fail"}`}>
            {aiResult.is_dog ? (
              <>✅ Dog detected: <strong>{aiResult.label}</strong> ({aiResult.confidence}%)</>
            ) : (
              <>❌ No dog detected in this photo</>
            )}
          </div>
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