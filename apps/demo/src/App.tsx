import { useEffect, useRef, useCallback } from "react";
import { useGameStore, useUIStore } from "./common/store";
import type { Character as CharacterType } from "./common/types";
import { PHYSICS_CONSTANTS } from "./common/physics-constants";

// Import PixiJS and the react-pixi components
import { Application, useTick, extend } from "@pixi/react";
import * as PIXI from "pixi.js";

// Use `extend` to make PIXI components available to the reconciler
extend({
  Graphics: PIXI.Graphics,
  Text: PIXI.Text,
  Container: PIXI.Container,
});

// --- PixiJS Components ---

// A PixiJS component for rendering a single character
const PixiCharacter = ({ character }: { character: CharacterType }) => {
  const colorMap: { [key: string]: number } = {
    "bg-red-400": 0xef4444,
    "bg-blue-400": 0x3b82f6,
    "bg-green-400": 0x22c55e,
    "bg-purple-400": 0x8b5cf6,
    "bg-pink-400": 0xec4899,
    "bg-indigo-400": 0x6366f1,
  };
  const fillColor = colorMap[character.color] || 0xffffff;

  // THE FIX: Updated to modern PixiJS v8 API
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.circle(0, 0, 24); // 1. Define the shape
      g.fill(fillColor); // 2. Fill it
      g.stroke({ width: 2, color: 0xffffff }); // 3. Stroke it
    },
    [fillColor]
  );

  // THE FIX: Wrap Graphics and Text in a Container to resolve the `addChild` warning.
  // The container is now responsible for the position.
  return (
    <pixiContainer x={character.position.x} y={character.position.y}>
      <pixiGraphics draw={draw} />
      <pixiText
        text={character.name}
        anchor={0.5}
        y={-40}
        style={
          new PIXI.TextStyle({
            fill: "white",
            fontSize: 14,
            fontFamily: "sans-serif",
            stroke: "black",
            fontWeight: "bold",
          })
        }
      />
    </pixiContainer>
  );
};

// A PixiJS component for rendering the platforms and game world
const GameScene = () => {
  const characters = useGameStore((state) => state.characters);

  const platforms = [
    {
      x: 0,
      y: window.innerHeight - 50,
      width: window.innerWidth,
      height: 50,
      color: 0x166534,
    },
    {
      x: 200,
      y: window.innerHeight - 150,
      width: 200,
      height: 20,
      color: 0x22c55e,
    },
    {
      x: 500,
      y: window.innerHeight - 250,
      width: 250,
      height: 20,
      color: 0x22c55e,
    },
    {
      x: 50,
      y: window.innerHeight - 350,
      width: 150,
      height: 20,
      color: 0x22c55e,
    },
  ];

  // THE FIX: Updated to modern PixiJS v8 API
  const drawPlatform = useCallback(
    (g: PIXI.Graphics, platform: (typeof platforms)[0]) => {
      g.clear();
      g.rect(0, 0, platform.width, platform.height); // 1. Define the shape
      g.fill(platform.color); // 2. Fill it
    },
    []
  );

  return (
    <pixiContainer>
      {/* Render Platforms */}
      {platforms.map((platform, i) => (
        <pixiGraphics
          key={i}
          draw={(g) => drawPlatform(g, platform)}
          x={platform.x}
          y={platform.y}
        />
      ))}
      {/* Render Characters */}
      {characters.map((character) => (
        <PixiCharacter key={character.id} character={character} />
      ))}
    </pixiContainer>
  );
};

// --- Game Logic Controller Component ---
const GameController = () => {
  const { clientId, actions: gameActions } = useGameStore();
  const inputs = useRef({ left: false, right: false });
  const lastSyncTime = useRef(performance.now());

  // Use the `useTick` hook, which provides a `delta` value for frame-rate independent physics.
  useTick((ticker) => {
    const delta = ticker.deltaTime; // The time elapsed since the last frame, normalized for 60fps.

    if (!clientId) return;

    const myCharacter = useGameStore
      .getState()
      .characters.find((c) => c.id === clientId);
    if (!myCharacter) return;

    const newVelocity = { ...myCharacter.velocity };
    if (inputs.current.left) newVelocity.x = -PHYSICS_CONSTANTS.MOVE_SPEED;
    else if (inputs.current.right) newVelocity.x = PHYSICS_CONSTANTS.MOVE_SPEED;
    else newVelocity.x = 0;
    newVelocity.y += PHYSICS_CONSTANTS.GRAVITY * delta;

    const newPosition = {
      x: myCharacter.position.x + newVelocity.x * delta,
      y: myCharacter.position.y + newVelocity.y * delta,
    };

    let newIsOnGround = false;
    const platforms = [
      {
        x: 0,
        y: window.innerHeight - 50,
        width: window.innerWidth,
        height: 50,
      },
      { x: 200, y: window.innerHeight - 150, width: 200, height: 20 },
      { x: 500, y: window.innerHeight - 250, width: 250, height: 20 },
      { x: 50, y: window.innerHeight - 350, width: 150, height: 20 },
    ];
    for (const platform of platforms) {
      if (
        newPosition.x > platform.x - 12 &&
        newPosition.x < platform.x + platform.width + 12 &&
        newPosition.y >= platform.y - 24 &&
        myCharacter.position.y < platform.y
      ) {
        newPosition.y = platform.y - 24;
        newVelocity.y = 0;
        newIsOnGround = true;
        break;
      }
    }

    if (newPosition.x < 24) newPosition.x = 24;
    if (newPosition.x > window.innerWidth - 24)
      newPosition.x = window.innerWidth - 24;

    const now = performance.now();
    if (now - lastSyncTime.current > PHYSICS_CONSTANTS.SYNC_INTERVAL) {
      lastSyncTime.current = now;
      gameActions.updatePlayerState(
        clientId,
        newPosition,
        newVelocity,
        newIsOnGround
      );
    }
  });

  useEffect(() => {
    if (!clientId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === "ArrowLeft") inputs.current.left = true;
      if (e.key === "ArrowRight") inputs.current.right = true;
      if (e.key === " " || e.key === "ArrowUp") gameActions.jump(clientId);
      if (e.key === "c") gameActions.cycleMyColor();
      if (e.key === "r") gameActions.resetPositions();
      if (e.key === "i") useUIStore.getState().actions.toggleInstructions();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") inputs.current.left = false;
      if (e.key === "ArrowRight") inputs.current.right = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [clientId, gameActions]);

  return null;
};

// --- Main App Component ---

function App() {
  const { characters, clientId, connectionStatus } = useGameStore();
  const { isInstructionsOpen, actions: uiActions } = useUIStore();
  const myCharacter = characters.find((c) => c.id === clientId);

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Application resizeTo={window} backgroundColor={0x0c4a6e}>
          <GameScene />
          <GameController />
        </Application>
      </div>
      <div className="absolute inset-0 z-10 pointer-events-none">
        {isInstructionsOpen && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-75 p-4 rounded-lg max-w-sm shadow-2xl pointer-events-auto">
            <h3 className="text-lg font-bold mb-2">2D Platformer Controls</h3>
            <ul className="text-sm space-y-1">
              <li>
                <strong className="text-cyan-400">← →</strong> Move left/right
              </li>
              <li>
                <strong className="text-cyan-400">Space/↑</strong> Jump
              </li>
              <li>
                <strong className="text-cyan-400">C</strong> Change color
              </li>
              <li>
                <strong className="text-cyan-400">R</strong> Reset positions
              </li>
              <li>
                <strong className="text-cyan-400">I</strong> Toggle instructions
              </li>
            </ul>
            <button
              onClick={uiActions.toggleInstructions}
              className="mt-2 px-3 py-1 bg-indigo-600 rounded text-xs hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 p-2 rounded shadow-lg pointer-events-auto">
          <div className="text-xs">
            Status: {connectionStatus}
            {clientId && <div>ID: {clientId.substring(0, 8)}...</div>}
          </div>
        </div>
        {myCharacter && (
          <div className="absolute top-20 right-4 bg-black bg-opacity-75 p-2 rounded text-xs shadow-lg pointer-events-auto">
            <div>
              Position: ({Math.round(myCharacter.position.x)},{" "}
              {Math.round(myCharacter.position.y)})
            </div>
            <div>
              Velocity: ({myCharacter.velocity.x.toFixed(1)},{" "}
              {myCharacter.velocity.y.toFixed(1)})
            </div>
            <div>On Ground: {myCharacter.isOnGround ? "Yes" : "No"}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
