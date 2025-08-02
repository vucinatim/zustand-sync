// src/server/server.ts (REVISED)

import { createServer } from "@zustand-sync/server";
import { gameStoreInitializer } from "./src/common/store";

// Helper functions for enemy AI
function isAtTarget(
  pos: { x: number; y: number },
  target: { x: number; y: number }
): boolean {
  const distance = Math.sqrt((pos.x - target.x) ** 2 + (pos.y - target.y) ** 2);
  return distance < 10; // Within 10 pixels
}

function moveTowards(
  pos: { x: number; y: number },
  target: { x: number; y: number }
): { x: number; y: number } {
  const dx = target.x - pos.x;
  const dy = target.y - pos.y;
  const distance = Math.sqrt(dx ** 2 + dy ** 2);

  if (distance === 0) return pos;

  const speed = 2; // pixels per tick
  const moveX = (dx / distance) * speed;
  const moveY = (dy / distance) * speed;

  return {
    x: pos.x + moveX,
    y: pos.y + moveY,
  };
}

// 3. Configure the server with the new generic tick system!
const { server } = createServer({
  initializer: gameStoreInitializer,

  // NEW: Provide a custom function for all server-side loop logic.
  serverTick: (storeController) => {
    // This function is the new home for our AI logic.
    const state = storeController.getState();

    console.log("⏱️ [ServerTick] Starting tick...");
    console.log("⏱️ [ServerTick] Current state:", {
      enemiesCount: state.enemies?.length || 0,
      charactersCount: state.characters?.length || 0,
    });

    // Spawn enemies periodically if there aren't enough
    if (!state.enemies || state.enemies.length < 3) {
      console.log("⏱️ [ServerTick] Spawning enemy...");
      const enemyId = `enemy-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const spawnPosition = {
        x: Math.random() * 800,
        y: Math.random() * 600,
      };
      console.log("⏱️ [ServerTick] Spawn details:", { enemyId, spawnPosition });
      storeController.dispatchSync(
        "spawnEnemy",
        [enemyId, spawnPosition, "patrol"],
        "server"
      );
      console.log("⏱️ [ServerTick] Spawn dispatch completed");
    } else {
      console.log(
        "⏱️ [ServerTick] No spawning needed, enemy count:",
        state.enemies.length
      );
    }

    if (!state.enemies || state.enemies.length === 0) {
      console.log("⏱️ [ServerTick] No enemies to process");
      return;
    }

    console.log("⏱️ [ServerTick] Processing", state.enemies.length, "enemies");
    for (const enemy of state.enemies) {
      console.log(
        "⏱️ [ServerTick] Processing enemy:",
        enemy.id,
        "at",
        enemy.position
      );

      // Simple "patrol" AI logic
      if (
        !enemy.patrolTarget ||
        isAtTarget(enemy.position, enemy.patrolTarget)
      ) {
        const newTarget = {
          x: enemy.position.x + (Math.random() - 0.5) * 200,
          y: enemy.position.y,
        };
        console.log(
          "⏱️ [ServerTick] Setting new patrol target for",
          enemy.id,
          ":",
          newTarget
        );
        storeController.dispatchSync(
          "updateEnemyState",
          [enemy.id, { patrolTarget: newTarget }],
          "server"
        );
        console.log("⏱️ [ServerTick] Patrol target update completed");
      } else {
        const newPosition = moveTowards(enemy.position, enemy.patrolTarget);
        console.log(
          "⏱️ [ServerTick] Moving enemy",
          enemy.id,
          "from",
          enemy.position,
          "to",
          newPosition
        );
        storeController.dispatchSync(
          "updateEnemyState",
          [enemy.id, { position: newPosition }],
          "server"
        );
        console.log("⏱️ [ServerTick] Position update completed");
      }
    }
    console.log("⏱️ [ServerTick] Tick completed");
  },

  // Optional: Configure the tick rate in milliseconds.
  serverTickRate: 500, // 1 tick per second

  // This is how a developer enables the latency simulation.
  // In a real project, you might control this with an environment variable.
  // e.g., process.env.NODE_ENV === 'development' ? 500 : 0
  // debug: {
  //   simulatedLatencyMs: 500, // 500ms delay
  // },
});

// 4. Start the server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(
    `Server is listening on port ${PORT} with generic tick system enabled.`
  );
});
