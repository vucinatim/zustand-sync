import { Application, extend } from "@pixi/react";
import * as PIXI from "pixi.js";
import { useGameStore } from "./common/store";

// Import components
import { PixiCharacter } from "./components/Character";
import { PixiEnemy } from "./components/Enemy";
import { GameScene } from "./components/World";
import { OverlayUI } from "./components/OverlayUI";
import { GameController } from "./components/GameController";
import { useCamera } from "./hooks/useCamera";

// Use `extend` to make PIXI components available to the reconciler
extend({
  Graphics: PIXI.Graphics,
  Text: PIXI.Text,
  Container: PIXI.Container,
});

// --- Main App Component ---
function App() {
  const characters = useGameStore((state) => state.characters);
  const enemies = useGameStore((state) => state.enemies);
  const camera = useCamera(); // Get camera position

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Application resizeTo={window} backgroundColor={0x0c4a6e}>
          {/* Apply camera transform to the entire game scene */}
          <pixiContainer x={camera.x} y={camera.y}>
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
