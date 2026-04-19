import { useState } from "react";
import MapView from "./components/MapView";
import "./styles/App.css";

function App() {
  const [pinCount, setPinCount] = useState(0);

  return (
    <div>
      <div className="header">
        <h1>🐾 PawMap</h1>
        <span className="counter">🐶 Dogs spotted: {pinCount}</span>
      </div>
      <MapView onPinAdded={() => setPinCount((c) => c + 1)} />
    </div>
  );
}

export default App;