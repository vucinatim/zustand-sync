import { createInitializer } from "@zustand-sync/client";
import type { Character, CharacterInput } from "./types";
import { PHYSICS_CONSTANTS } from "./physics-constants";
import { PLATFORMS } from "./world-constants";

// Helper functions for enemy AI (moved from server.ts)
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

// 1. Define the user's state and actions as if it were a normal store.
// Notice there is no mention of `FrameworkState` here.
export interface Enemy {
  id: string;
  position: { x: number; y: number };
  patrolTarget?: { x: number; y: number };
  health: number;
  type: string;
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  moveSpeed?: number;
  moveRange?: number;
  moveOffset?: number;
  currentX: number; // Current animated position
}

export interface GameState {
  characters: Character[];
  enemies: Enemy[]; // NEW: Enemy state
  platforms: Platform[]; // NEW: Platform state
  serverTime: number; // NEW: Server's authoritative time
}

export interface GameActions {
  // NEW: The isomorphic tick function
  tick: (deltaTime: number, senderId?: string) => void;

  // NEW: Update server time
  updateServerTime: (time: number, senderId?: string) => void;

  // --- NEW ACTION ---
  setInputState: (
    characterId: string,
    input: Partial<CharacterInput>, // Send only the changes
    senderId?: string
  ) => void;

  // NEW actions for enemy management
  spawnEnemy: (
    enemyId: string,
    position: { x: number; y: number },
    type?: "patrol" | "chase",
    senderId?: string
  ) => void;
  updateEnemyState: (
    enemyId: string,
    updates: Partial<Enemy>,
    senderId?: string
  ) => void;
  removeEnemy: (enemyId: string, senderId?: string) => void;

  // NEW actions for platform management
  updatePlatformPosition: (
    platformId: string,
    x: number,
    senderId?: string
  ) => void;
  addPlatform: (platform: Platform, senderId?: string) => void;

  // Keep these actions
  cycleMyColor: (senderId?: string) => void;
  addCharacter: (id: string, senderId?: string) => void;
  removeCharacter: (id: string, senderId?: string) => void;

  // This can be removed or kept for debugging
  resetPositions: () => void;
}

const COLORS = [
  "bg-red-400",
  "bg-blue-400",
  "bg-green-400",
  "bg-purple-400",
  "bg-pink-400",
  "bg-indigo-400",
];
const INITIAL_POSITIONS: { [key: string]: { x: number; y: number } } = {};

// 3. Create the store initializer.
export const gameStoreInitializer = createInitializer<GameState, GameActions>(
  {
    // Argument 1: The initial state
    characters: [],
    enemies: [
      {
        id: "enemy-1",
        position: { x: 900, y: 2800 },
        health: 100,
        type: "patrol",
      },
      {
        id: "enemy-2",
        position: { x: 1100, y: 2800 },
        health: 100,
        type: "patrol",
      },
      {
        id: "enemy-3",
        position: { x: 1000, y: 2800 },
        health: 100,
        type: "patrol",
      },
    ],
    platforms: PLATFORMS.map((platform, index) => ({
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
    })),
    serverTime: Date.now(),
  },
  (set, get) => ({
    tick: (deltaTime: number, senderId?: string) => {
      const isServer = !!senderId;
      const state = get();

      // --- Platform Logic ---
      const updatedPlatforms = state.platforms.map((platform) => {
        if (!platform.moveSpeed || !platform.moveRange) return platform;
        const currentTime = state.serverTime;
        const centerX = platform.x;
        const offset =
          Math.sin(currentTime * platform.moveSpeed * 0.001) *
          platform.moveRange;
        const newX = centerX + offset;
        return { ...platform, currentX: newX };
      });

      // --- Enemy AI Logic ---
      const updatedEnemies = state.enemies.map((enemy) => {
        if (isServer) {
          if (
            !enemy.patrolTarget ||
            isAtTarget(enemy.position, enemy.patrolTarget)
          ) {
            const newTarget = {
              x: enemy.position.x + (Math.random() - 0.5) * 200,
              y: enemy.position.y,
            };
            return { ...enemy, patrolTarget: newTarget };
          } else {
            const newPosition = moveTowards(enemy.position, enemy.patrolTarget);
            return { ...enemy, position: newPosition };
          }
        }
        return enemy;
      });

      // --- PLAYER PHYSICS LOGIC (REFACTORED) ---
      const updatedCharacters = state.characters.map((char) => {
        // --- IMMUTABILITY FIX ---
        // 1. Create a mutable copy of the inputs for the new state object.
        const newInputs = { ...char.inputs };

        // 2. Determine Target Velocity from INPUTS
        let targetVelocityX = 0;
        if (char.inputs.left) targetVelocityX = -PHYSICS_CONSTANTS.MOVE_SPEED;
        if (char.inputs.right) targetVelocityX = PHYSICS_CONSTANTS.MOVE_SPEED;

        const newVelocityX =
          char.velocity.x + (targetVelocityX - char.velocity.x) * 0.2;

        // 3. Handle Jump from INPUTS
        let newVelocityY = char.velocity.y;
        if (char.inputs.jump) {
          newVelocityY = PHYSICS_CONSTANTS.JUMP_VELOCITY;
        }

        // 5. Apply Gravity and calculate new position
        newVelocityY += PHYSICS_CONSTANTS.GRAVITY * deltaTime;

        const newVelocity = {
          x: newVelocityX,
          y: newVelocityY,
        };

        const newPosition = {
          x: char.position.x + newVelocity.x * deltaTime,
          y: char.position.y + newVelocity.y * deltaTime,
        };

        let newIsOnGround = false;

        // 6. Collision detection with platforms
        for (const platform of state.platforms) {
          const platformX = platform.currentX || platform.x;
          if (
            newPosition.x > platformX - 12 &&
            newPosition.x < platformX + platform.width + 12 &&
            newPosition.y >= platform.y - 24 &&
            char.position.y < platform.y
          ) {
            newPosition.y = platform.y - 24;
            newVelocity.y = 0;
            newIsOnGround = true;
            break;
          }
        }

        // 7. World bounds
        if (newPosition.x < 24) newPosition.x = 24;
        if (newPosition.x > 2000 - 24) newPosition.x = 2000 - 24;

        // 8. Return the new character object with all updated properties
        return {
          ...char,
          position: newPosition,
          velocity: newVelocity,
          isOnGround: newIsOnGround,
          inputs: newInputs, // Use the (potentially) modified copy
        };
      });

      // Set the new state all at once
      set({
        platforms: updatedPlatforms,
        enemies: updatedEnemies,
        characters: updatedCharacters,
      });
    },

    setInputState: (characterId, input, senderId) => {
      const isServer = !!senderId;
      if (isServer && senderId !== characterId) {
        return;
      }
      set((state) => ({
        characters: state.characters.map((char) =>
          char.id === characterId
            ? { ...char, inputs: { ...char.inputs, ...input } }
            : char
        ),
      }));
    },

    cycleMyColor: (senderId?: string) => {
      const myId = senderId || get().clientId;
      if (!myId) return;
      set((state) => ({
        characters: state.characters.map((char) => {
          if (char.id !== myId) return char;
          const currentColorIndex = COLORS.indexOf(char.color);
          const nextColorIndex = (currentColorIndex + 1) % COLORS.length;
          return { ...char, color: COLORS[nextColorIndex] };
        }),
      }));
    },

    resetPositions: () => {
      set((state) => ({
        characters: state.characters.map((char) => ({
          ...char,
          position: INITIAL_POSITIONS[char.id] || { x: 100, y: 100 },
          velocity: { x: 0, y: 0 },
          isOnGround: false,
        })),
      }));
    },

    addCharacter: (id: string, senderId?: string) => {
      if (senderId && id !== senderId) return;
      if (get().characters.some((c) => c.id === id)) return;

      const newPosition = {
        x: Math.floor(Math.random() * 400) + 800,
        y: Math.floor(Math.random() * 200) + 2800,
      };
      INITIAL_POSITIONS[id] = newPosition;

      const newCharacter: Character = {
        id,
        name: `Player-${id.substring(0, 4)}`,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        position: newPosition,
        velocity: { x: 0, y: 0 },
        isOnGround: false,
        lastMoveTimestamp: Date.now(),
        inputs: { left: false, right: false, jump: false },
      };
      set((state) => ({ characters: [...state.characters, newCharacter] }));
    },

    removeCharacter: (id: string, senderId?: string) => {
      if (senderId && id !== senderId) return;
      delete INITIAL_POSITIONS[id];
      set((state) => ({
        characters: state.characters.filter((char) => char.id !== id),
      }));
    },

    spawnEnemy: (
      enemyId: string,
      position: { x: number; y: number },
      type: "patrol" | "chase" = "patrol",
      senderId?: string
    ) => {
      if (senderId !== "server") return;
      const newEnemy: Enemy = {
        id: enemyId,
        position,
        health: 100,
        type,
      };
      set((state) => ({
        enemies: [...state.enemies, newEnemy],
      }));
    },

    updateEnemyState: (
      enemyId: string,
      updates: Partial<Enemy>,
      senderId?: string
    ) => {
      if (senderId !== "server") return;
      set((state) => ({
        enemies: state.enemies.map((enemy) =>
          enemy.id === enemyId ? { ...enemy, ...updates } : enemy
        ),
      }));
    },

    removeEnemy: (enemyId: string, senderId?: string) => {
      if (senderId) return;
      set((state) => ({
        enemies: state.enemies.filter((enemy) => enemy.id !== enemyId),
      }));
    },

    updatePlatformPosition: (
      platformId: string,
      x: number,
      senderId?: string
    ) => {
      if (senderId !== "server") return;
      set((state) => ({
        platforms: state.platforms.map((platform) =>
          platform.id === platformId ? { ...platform, currentX: x } : platform
        ),
      }));
    },

    addPlatform: (platform: Platform, senderId?: string) => {
      if (senderId !== "server") return;
      set((state) => ({
        platforms: [...state.platforms, platform],
      }));
    },

    updateServerTime: (time: number, senderId?: string) => {
      if (senderId !== "server") return;
      set({ serverTime: time });
    },
  })
);
