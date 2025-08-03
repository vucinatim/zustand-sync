import { Application, extend } from "@pixi/react";
import * as PIXI from "pixi.js";
import { useGameStore } from "./store";

// Import components
import { PixiCharacter } from "./components/Character";
import { PixiEnemy } from "./components/Enemy";
import { GameScene, GameBackground } from "./components/World";
import { OverlayUI } from "./components/OverlayUI";
import { GameController } from "./components/GameController";
import { useCamera } from "./hooks/useCamera";

// Use `extend` to make PIXI components available to the reconciler
extend({
  Graphics: PIXI.Graphics,
  Text: PIXI.Text,
  Container: PIXI.Container,
});

// Debug DPI settings
console.log("Device Pixel Ratio:", window.devicePixelRatio);
console.log(
  "Screen Resolution:",
  window.screen.width,
  "x",
  window.screen.height
);
console.log("Window Size:", window.innerWidth, "x", window.innerHeight);

// Calculate optimal resolution for Retina displays
const optimalResolution = Math.max(window.devicePixelRatio || 1, 2.5);
console.log("Using Resolution:", optimalResolution);

// --- Main App Component ---
function App() {
  const characters = useGameStore((state) => state.characters);
  const enemies = useGameStore((state) => state.enemies);
  const camera = useCamera(); // Get camera position

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Application
          resizeTo={window}
          backgroundColor={0x1a1a1a}
          resolution={optimalResolution}
          antialias={true}
          autoDensity={true}
          powerPreference="high-performance"
        >
          {/* Apply camera transform to the entire game scene */}
          <pixiContainer x={camera.x} y={camera.y}>
            <GameBackground />
            <GameScene />
            {/* Render Characters */}
            {characters.map((character) => (
              <PixiCharacter key={character.id} character={character} />
            ))}
            {/* Render Enemies */}
            {enemies.map((enemy) => (
              <PixiEnemy key={enemy.id} enemy={enemy} />
            ))}
            <GameController />
          </pixiContainer>
        </Application>
      </div>
      <OverlayUI />
    </div>
  );
}

export default App;
