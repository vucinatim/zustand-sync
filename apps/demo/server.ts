// src/server/server.ts (REVISED)

import { createServer } from "@zustand-sync/server";
import { gameStoreInitializer } from "./src/common/store";
import { PLATFORMS } from "./src/common/world-constants";

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

// Helper function for platform movement
function calculatePlatformPosition(
  platform: {
    x: number;
    moveSpeed?: number;
    moveRange?: number;
  },
  time: number
) {
  if (!platform.moveSpeed || !platform.moveRange) {
    return platform.x;
  }

  const centerX = platform.x;
  const offset =
    Math.sin(time * platform.moveSpeed * 0.001) * platform.moveRange;

  return centerX + offset;
}

// 3. Configure the server with the new generic tick system!
const { server } = createServer({
  initializer: gameStoreInitializer,

  // NEW: Provide a custom function for all server-side loop logic.
  serverTick: (storeController) => {
    // This function is the new home for our AI logic.
    const state = storeController.getState();
    const currentTime = Date.now();

    // Initialize platforms if they don't exist
    if (!state.platforms || state.platforms.length === 0) {
      const platformData = PLATFORMS.map((platform, index) => ({
        id: `platform-${index}`,
        x: platform.x,
        y: platform.y,
        width: platform.width,
        height: platform.height,
        color: platform.color,
        moveSpeed: platform.moveSpeed,
        moveRange: platform.moveRange,
        moveOffset: platform.moveOffset,
        currentX: platform.x,
      }));

      // Add platforms to the store
      platformData.forEach((platform) => {
        storeController.dispatchSync("addPlatform", [platform], "server");
      });
    }

    // Update moving platforms
    if (state.platforms && state.platforms.length > 0) {
      for (const platform of state.platforms) {
        if (platform.moveSpeed && platform.moveRange) {
          const newX = calculatePlatformPosition(platform, currentTime);
          if (Math.abs(platform.currentX - newX) > 0.1) {
            storeController.dispatchSync(
              "updatePlatformPosition",
              [platform.id, newX],
              "server"
            );
          }
        }
      }
    }

    // Spawn enemies periodically if there aren't enough
    if (!state.enemies || state.enemies.length < 3) {
      const enemyId = `enemy-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const spawnPosition = {
        x: Math.random() * 800,
        y: Math.random() * 600,
      };
      storeController.dispatchSync(
        "spawnEnemy",
        [enemyId, spawnPosition, "patrol"],
        "server"
      );
    }

    if (!state.enemies || state.enemies.length === 0) {
      return;
    }

    for (const enemy of state.enemies) {
      // Simple "patrol" AI logic
      if (
        !enemy.patrolTarget ||
        isAtTarget(enemy.position, enemy.patrolTarget)
      ) {
        const newTarget = {
          x: enemy.position.x + (Math.random() - 0.5) * 200,
          y: enemy.position.y,
        };
        storeController.dispatchSync(
          "updateEnemyState",
          [enemy.id, { patrolTarget: newTarget }],
          "server"
        );
      } else {
        const newPosition = moveTowards(enemy.position, enemy.patrolTarget);
        storeController.dispatchSync(
          "updateEnemyState",
          [enemy.id, { position: newPosition }],
          "server"
        );
      }
    }
  },

  // Optional: Configure the tick rate in milliseconds.
  serverTickRate: 33, // 30 ticks per second

  // NEW: Control server tick system
  serverTickEnabled: true, // Set to false to freeze server time

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
