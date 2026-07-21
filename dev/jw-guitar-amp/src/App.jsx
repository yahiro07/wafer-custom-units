import { setupEffectEngine } from "./audio/effect-engine";
import { useEffect } from "react";
import logo from "./assets/logo/logo-gray.jpg";
import "./App.css";

function Header() {
  return (
    <div className="header">
      <img src={logo} alt="logo" />
    </div>
  );
}

function Mixer() {
  return (
    <div className="mixer">
      <div className="grid">
        <label htmlFor="volume">Volume</label>
        <input
          type="range"
          id="volume"
          min="0"
          max="1"
          defaultValue="0.5"
          step=".01"
        />
        <label htmlFor="treble">Treble</label>
        <input type="range" id="treble" min="-10" max="10" defaultValue="0" />

        <label htmlFor="mid">Mid</label>
        <input type="range" id="mid" min="-10" max="10" defaultValue="0" />

        <label htmlFor="bass">Bass</label>
        <input type="range" id="bass" min="-10" max="10" defaultValue="0" />
      </div>
    </div>
  );
}

function VisualizerCanvas() {
  return (
    <div className="canvas">
      <canvas id="visualizer" />
    </div>
  );
}

function App() {
  useEffect(setupEffectEngine, []);
  return (
    <div className="app">
      <div className="top-row">
        <Header />
        <Mixer />
      </div>
      <VisualizerCanvas />
    </div>
  );
}

export default App;
