import { useEffect, useState } from "react";
import { useGameStore, useUIStore } from "./common/store";
import { Character } from "./components/Character";

function App() {
  const [roomIdInput, setRoomIdInput] = useState("main-lobby");

  // --- Selecting state from the Synced Store ---
  const characters = useGameStore((state) => state.characters);
  const { connectionStatus, clientId, api, _roomId } = useGameStore();
  const gameActions = useGameStore((state) => state.actions);

  // --- Selecting state from the Local UI Store ---
  const isInstructionsOpen = useUIStore((state) => state.isInstructionsOpen);
  const uiActions = useUIStore((state) => state.actions);

  const handleJoinRoom = () => {
    if (roomIdInput) api.connect(roomIdInput);
  };

  const handleLeaveRoom = () => {
    api.disconnect();
  };

  const handleColorChange = () => {
    gameActions.cycleMyColor();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (connectionStatus !== "connected") return;

      const myCharacter = characters.find((c) => c.id === clientId);
      if (!myCharacter) return;

      const moveDistance = 20;
      const newPosition = { ...myCharacter.position };

      switch (event.key) {
        case "ArrowUp":
          newPosition.y -= moveDistance;
          break;
        case "ArrowDown":
          newPosition.y += moveDistance;
          break;
        case "ArrowLeft":
          newPosition.x -= moveDistance;
          break;
        case "ArrowRight":
          newPosition.x += moveDistance;
          break;
        default:
          return;
      }

      newPosition.x = Math.max(
        24,
        Math.min(window.innerWidth - 24, newPosition.x)
      );
      newPosition.y = Math.max(
        24,
        Math.min(window.innerHeight - 24, newPosition.y)
      );

      gameActions.moveCharacter(myCharacter.id, newPosition);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [characters, gameActions, clientId, connectionStatus]);

  return (
    <div className="w-screen h-screen bg-gray-900 text-white font-sans overflow-hidden">
      {/* Game Area */}
      <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900">
        {connectionStatus === "connected" &&
          characters.map((character) => (
            <Character key={character.id} character={character} />
          ))}
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>
      </div>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700 pointer-events-auto">
          <h1 className="text-2xl font-bold text-white mb-2">
            Zustand-Sync Rooms
          </h1>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-300">Status:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                connectionStatus === "connected"
                  ? "bg-green-500/20 text-green-400"
                  : connectionStatus === "connecting"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {connectionStatus}
            </span>
          </div>
          {connectionStatus === "connected" && (
            <>
              <p className="text-xs text-gray-400 mb-1">Room ID: {_roomId}</p>
              <p className="text-xs text-gray-400 mb-3">
                Client ID: {clientId}
              </p>
              <p className="text-sm text-gray-300 mb-4">
                Use{" "}
                <span className="font-mono bg-gray-700 px-1 rounded">↑↓←→</span>{" "}
                to move
              </p>
              <button
                onClick={gameActions.resetPositions}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Reset Positions
              </button>
              <button
                onClick={handleColorChange}
                className="mt-2 w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Change My Color
              </button>
            </>
          )}
        </div>

        {/* Room Connection UI */}
        <div className="absolute top-6 right-6 bg-black/80 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700 pointer-events-auto">
          {connectionStatus !== "connected" ? (
            <div className="flex flex-col gap-2 w-48">
              <h3 className="font-bold text-white">Join a Room</h3>
              <input
                type="text"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                className="bg-gray-700 text-white p-2 rounded pointer-events-auto"
                placeholder="Enter Room ID"
              />
              <button
                onClick={handleJoinRoom}
                disabled={!roomIdInput || connectionStatus === "connecting"}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-all pointer-events-auto"
              >
                {connectionStatus === "connecting" ? "Connecting..." : "Join"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 w-48">
              <h3 className="font-bold text-white">You are connected</h3>
              <button
                onClick={handleLeaveRoom}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all pointer-events-auto"
              >
                Leave Room
              </button>
            </div>
          )}
        </div>

        {/* Instructions UI */}
        {isInstructionsOpen && (
          <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700 pointer-events-auto">
            <h3 className="text-lg font-semibold text-white mb-2 flex justify-between items-center">
              <span>How to Play</span>
              <button
                onClick={uiActions.toggleInstructions}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Join a room to start playing</li>
              <li>• Move with arrow keys</li>
              <li>• Watch other players in real-time</li>
              <li>• Open multiple windows to test</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
