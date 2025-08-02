import { useGameStore, useUIStore } from "../common/store";

export const OverlayUI = () => {
  const characters = useGameStore((state) => state.characters);
  const enemies = useGameStore((state) => state.enemies);
  const clientId = useGameStore((state) => state.clientId);
  const connectionStatus = useGameStore((state) => state.connectionStatus);
  const { isInstructionsOpen, actions: uiActions } = useUIStore();
  const myCharacter = characters.find((c) => c.id === clientId);

  return (
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
      {/* NEW: Enemy information */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 p-2 rounded text-xs shadow-lg pointer-events-auto">
        <div className="font-bold mb-1">Enemies: {enemies.length}</div>
        {enemies.slice(0, 3).map((enemy) => (
          <div key={enemy.id} className="text-xs">
            {enemy.id.substring(0, 8)}: ({Math.round(enemy.position.x)},{" "}
            {Math.round(enemy.position.y)})
          </div>
        ))}
        {enemies.length > 3 && (
          <div className="text-xs text-gray-400">
            ...and {enemies.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};
