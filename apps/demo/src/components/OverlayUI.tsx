import { useGameStore, useUIStore } from "../common/store";
import { WORLD_CONSTANTS } from "../common/world-constants";
import React from "react";

export const OverlayUI = () => {
  const clientId = useGameStore((state) => state.clientId);
  const characters = useGameStore((state) => state.characters);
  const enemies = useGameStore((state) => state.enemies);
  const isInstructionsOpen = useUIStore((state) => state.isInstructionsOpen);
  const toggleInstructions = useUIStore(
    (state) => state.actions.toggleInstructions
  );

  // UI state for mode switching
  const [uiMode, setUIMode] = React.useState<"gameplay" | "debug">("gameplay");
  const [selectedRoom, setSelectedRoom] = React.useState("room-1");

  // Calculate height percentage
  const myCharacter = characters.find((c) => c.id === clientId);
  const heightPercentage = myCharacter
    ? Math.max(
        0,
        Math.min(
          100,
          ((WORLD_CONSTANTS.HEIGHT - myCharacter.position.y) /
            WORLD_CONSTANTS.HEIGHT) *
            100
        )
      )
    : 0;

  // Room options
  const roomOptions = ["room-1", "room-2", "room-3", "room-4", "room-5"];

  // Color mapping for player icons
  const colorMap: { [key: string]: string } = {
    "bg-red-400": "#ef4444",
    "bg-blue-400": "#3b82f6",
    "bg-green-400": "#22c55e",
    "bg-purple-400": "#8b5cf6",
    "bg-pink-400": "#ec4899",
    "bg-indigo-400": "#6366f1",
  };

  return (
    <>
      {/* Gameplay Mode UI */}
      {uiMode === "gameplay" && (
        <div className="fixed flex flex-col gap-2 p-4 top-0 left-0 z-50">
          {/* UI Mode Toggle - Below Room Selection */}
          <div className="flex gap-2">
            <button
              onClick={() => setUIMode("gameplay")}
              className="px-3 py-1 rounded text-sm backdrop-blur-sm bg-green-600/80 text-white"
            >
              Gameplay
            </button>
            <button
              onClick={() => setUIMode("debug")}
              className="px-3 py-1 rounded text-sm backdrop-blur-sm bg-gray-600/60 text-gray-300"
            >
              Debug
            </button>
          </div>
          {/* Combined Progress & Players - Top Left */}
          <div className="bg-black/40 backdrop-blur-sm text-white p-4 rounded-lg">
            <div className="text-sm font-bold mb-2">Tower Progress</div>
            <div className="w-32 h-3 bg-gray-700/60 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-t from-green-500 to-green-400 transition-all duration-300"
                style={{ width: `${heightPercentage}%` }}
              />
            </div>
            <div className="text-xs mb-3 text-gray-300 font-mono">
              {heightPercentage.toFixed(1)}% to the top
            </div>

            <div className="text-sm font-bold mb-2">Players Online</div>
            <div className="space-y-1">
              {characters.map((char) => (
                <div key={char.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: colorMap[char.color] || "#ffffff",
                    }}
                  />
                  <span className="text-xs font-mono">
                    {char.name} {char.id === clientId ? "(You)" : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Room Selection - Below Progress & Players */}
          <div className="bg-black/40 backdrop-blur-sm text-white p-4 rounded-lg">
            <h3 className="text-sm font-bold mb-2">Room Selection</h3>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="bg-gray-700/60 w-full text-white px-3 py-1 rounded text-sm backdrop-blur-sm"
            >
              {roomOptions.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Debug Mode UI */}
      {uiMode === "debug" && (
        <div className="fixed flex flex-col gap-2 p-4 top-0 left-0 z-50">
          {/* UI Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setUIMode("gameplay")}
              className="px-3 py-1 rounded text-sm backdrop-blur-sm bg-gray-600/60 text-gray-300"
            >
              Gameplay
            </button>
            <button
              onClick={() => setUIMode("debug")}
              className="px-3 py-1 rounded text-sm backdrop-blur-sm bg-blue-600/80 text-white"
            >
              Debug
            </button>
          </div>

          {/* Instructions Panel - Only in Debug */}
          {isInstructionsOpen && (
            <div className="bg-black/40 backdrop-blur-sm text-white p-4 rounded-lg max-w-xs">
              <h3 className="text-lg font-bold mb-2">2D Platformer Controls</h3>
              <ul className="text-sm space-y-1">
                <li>← → Move left/right</li>
                <li>Space/↑ Jump</li>
                <li>C Change color</li>
                <li>R Reset positions</li>
                <li>I Toggle instructions</li>
              </ul>
              <button
                onClick={toggleInstructions}
                className="mt-3 bg-purple-600/80 hover:bg-purple-700/80 px-3 py-1 rounded text-sm backdrop-blur-sm"
              >
                Close
              </button>
            </div>
          )}

          {/* Connection Status */}
          <div className="bg-black/40 backdrop-blur-sm text-white p-4 rounded-lg">
            <div className="text-sm">
              <div>Status: connected</div>
              <div className="font-mono">
                ID: {clientId?.substring(0, 8)}...
              </div>
            </div>
          </div>

          {/* Player Debug Info */}
          {myCharacter && (
            <div className="bg-black/40 backdrop-blur-sm text-white p-4 rounded-lg">
              <div className="text-sm space-y-1">
                <div className="font-mono">
                  Position: ({myCharacter.position.x.toFixed(0)},{" "}
                  {myCharacter.position.y.toFixed(0)})
                </div>
                <div className="font-mono">
                  Velocity: ({myCharacter.velocity.x.toFixed(1)},{" "}
                  {myCharacter.velocity.y.toFixed(1)})
                </div>
                <div>On Ground: {myCharacter.isOnGround ? "Yes" : "No"}</div>
              </div>
            </div>
          )}

          {/* Enemies Debug Info */}
          <div className="bg-black/40 backdrop-blur-sm text-white p-4 rounded-lg">
            <div className="text-sm">
              <div className="font-bold mb-1">
                Enemies: <span className="font-mono">{enemies.length}</span>
              </div>
              {enemies.map((enemy) => (
                <div key={enemy.id} className="text-xs font-mono">
                  {enemy.id}: ({enemy.position.x.toFixed(0)},{" "}
                  {enemy.position.y.toFixed(0)})
                </div>
              ))}
            </div>
          </div>

          {/* Cursor Button */}
          <div>
            <button className="bg-black/40 backdrop-blur-sm text-white px-3 py-1 rounded text-sm">
              Cursor
            </button>
          </div>
        </div>
      )}
    </>
  );
};
