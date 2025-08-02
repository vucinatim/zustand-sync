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
interface GameState {
  characters: Character[];
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
                ...char,
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

    cycleMyColor: () => {
      const myId = get().clientId; // `get()` is automatically typed correctly!
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
