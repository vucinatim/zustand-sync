import { create } from "zustand";
import {
  createInitializer,
  sync,
  type FrameworkState,
} from "@zustand-sync/client";
import type { Character } from "./types";
import { PHYSICS_CONSTANTS } from "./physics-constants";

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

interface GameState {
  characters: Character[];
  enemies: Enemy[]; // NEW: Enemy state
  platforms: Platform[]; // NEW: Platform state
}

interface GameActions {
  // NEW action for physics-based movement
  updatePlayerState: (
    characterId: string,
    position: { x: number; y: number },
    velocity: { x: number; y: number },
    isOnGround: boolean,
    senderId?: string
  ) => void;

  // NEW action for jumping
  jump: (characterId: string, senderId?: string) => void;

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

// 2. Define the final, combined store type for use in our components.
export type GameStore = GameState & FrameworkState;

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
// It uses Zustand's `StateCreator` type for `GameState`. This is standard practice.
// The `get` function here will only see `GameState`. Our middleware correctly
// provides the `clientId` from the full state when `cycleMyColor` needs it.
const gameStoreInitializer = createInitializer<GameState, GameActions>(
  {
    // Argument 1: The initial state
    characters: [],
    enemies: [
      {
        id: "enemy-1",
        position: { x: 300, y: 500 },
        health: 100,
        type: "patrol",
      },
      {
        id: "enemy-2",
        position: { x: 500, y: 500 },
        health: 100,
        type: "patrol",
      },
      {
        id: "enemy-3",
        position: { x: 700, y: 500 },
        health: 100,
        type: "patrol",
      },
    ],
    platforms: [], // Initialize empty platforms array
  },
  (set, get) => ({
    updatePlayerState: (
      characterId,
      position,
      velocity,
      isOnGround,
      senderId
    ) => {
      const isServer = !!senderId;

      if (isServer) {
        const character = get().characters.find((c) => c.id === characterId);
        if (!character) return;

        // TODO: Add movement validation back later if needed
        // For now, trust the client for responsive movement
      }

      // SHARED LOGIC: Update the character's full state.
      set((state) => ({
        characters: state.characters.map((char) =>
          char.id === characterId
            ? {
                ...char, // Preserve all existing properties including color
                position,
                velocity,
                isOnGround,
                lastMoveTimestamp: isServer
                  ? Date.now()
                  : char.lastMoveTimestamp,
              }
            : char
        ),
      }));
    },

    jump: (characterId: string, senderId?: string) => {
      const isServer = !!senderId;

      if (isServer) {
        const character = get().characters.find((c) => c.id === characterId);
        // VALIDATION: Player must be on the ground to jump.
        if (!character || !character.isOnGround) {
          return; // Reject the action.
        }
      }

      // SHARED LOGIC: Apply jump velocity.
      set((state) => ({
        characters: state.characters.map((char) =>
          char.id === characterId
            ? {
                ...char,
                velocity: {
                  ...char.velocity,
                  y: PHYSICS_CONSTANTS.JUMP_VELOCITY,
                },
                isOnGround: false,
              }
            : char
        ),
      }));
    },

    cycleMyColor: (senderId?: string) => {
      const myId = senderId || get().clientId;
      if (!myId) return;

      // Allow both client and server to cycle colors
      // Client can change their own color, server can validate
      // senderId parameter is needed for proper network dispatching

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
        x: Math.floor(Math.random() * 800),
        y: Math.floor(Math.random() * 600),
      };
      INITIAL_POSITIONS[id] = newPosition;

      const newCharacter: Character = {
        id,
        name: `Player-${id.substring(0, 4)}`,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        position: newPosition,
        // --- NEW PROPERTIES ---
        velocity: { x: 0, y: 0 },
        isOnGround: false,
        lastMoveTimestamp: Date.now(),
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

    // NEW: Enemy management actions
    spawnEnemy: (
      enemyId: string,
      position: { x: number; y: number },
      type: "patrol" | "chase" = "patrol",
      senderId?: string
    ) => {
      if (senderId !== "server") return; // Only server can spawn enemies

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
      if (senderId !== "server") return; // Only server can update enemies

      set((state) => ({
        enemies: state.enemies.map((enemy) =>
          enemy.id === enemyId ? { ...enemy, ...updates } : enemy
        ),
      }));
    },

    removeEnemy: (enemyId: string, senderId?: string) => {
      if (senderId) return; // Only server can remove enemies

      set((state) => ({
        enemies: state.enemies.filter((enemy) => enemy.id !== enemyId),
      }));
    },

    // NEW: Platform management actions
    updatePlatformPosition: (
      platformId: string,
      x: number,
      senderId?: string
    ) => {
      if (senderId !== "server") return; // Only server can update platforms

      set((state) => ({
        platforms: state.platforms.map((platform) =>
          platform.id === platformId ? { ...platform, currentX: x } : platform
        ),
      }));
    },

    addPlatform: (platform: Platform, senderId?: string) => {
      if (senderId !== "server") return; // Only server can add platforms

      set((state) => ({
        platforms: [...state.platforms, platform],
      }));
    },
  })
);

// 4. Create the final store.
// We provide our final `GameStore` type to `create`.
// We compose our `synced` middleware with `devtools`.
export const useGameStore = create(sync(gameStoreInitializer));

// --- Local UI Store (unchanged) ---
interface UIState {
  isInstructionsOpen: boolean;
  actions: { toggleInstructions: () => void };
}
export const useUIStore = create<UIState>((set) => ({
  isInstructionsOpen: true,
  actions: {
    toggleInstructions: () =>
      set((state) => ({ isInstructionsOpen: !state.isInstructionsOpen })),
  },
}));

// Export the initializer for the server to use.
export { gameStoreInitializer };
