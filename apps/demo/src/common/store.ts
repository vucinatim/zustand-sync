import { create } from "zustand";
import {
  createInitializer,
  sync,
  type FrameworkState,
} from "@zustand-sync/client";
import type { Character } from "./types";

// 1. Define the user's state and actions as if it were a normal store.
interface GameState {
  characters: Character[];
}

// 2. THE FIX: Update the action's signature to accept an optional senderId
interface GameActions {
  moveCharacter: (
    characterId: string,
    position: { x: number; y: number }
  ) => void;
  cycleMyColor: (senderId?: string) => void; // MODIFIED HERE
  resetPositions: () => void;
  addCharacter: (id: string, senderId?: string) => void;
  removeCharacter: (id: string, senderId?: string) => void;
}

// 3. Define the final, combined store type for use in our components.
export type GameStore = GameState & { actions: GameActions } & FrameworkState;

const COLORS = [
  "bg-red-400",
  "bg-blue-400",
  "bg-green-400",
  "bg-purple-400",
  "bg-pink-400",
  "bg-indigo-400",
];
const INITIAL_POSITIONS: { [key: string]: { x: number; y: number } } = {};

// 4. Create the store initializer using the helper.
const gameStoreInitializer = createInitializer<GameState, GameActions>(
  {
    characters: [],
  },
  (set, get) => ({
    moveCharacter: (characterId, position) => {
      set((state) => ({
        characters: state.characters.map((char) =>
          char.id === characterId ? { ...char, position } : char
        ),
      }));
    },
    // 5. THE FIX: Update the implementation to use the senderId
    cycleMyColor: (senderId?: string) => {
      // On the client, senderId will be undefined, so we fall back to get().clientId.
      // On the server, the dispatcher provides the senderId, which we use.
      const myId = senderId || get().clientId;
      if (!myId) {
        return;
      }

      set((state) => ({
        characters: state.characters.map((char) => {
          if (char.id !== myId) {
            return char;
          }
          const currentColorIndex = COLORS.indexOf(char.color);
          const nextColorIndex = (currentColorIndex + 1) % COLORS.length;
          const newColor = COLORS[nextColorIndex];
          return { ...char, color: newColor };
        }),
      }));
    },
    resetPositions: () => {
      set((state) => ({
        characters: state.characters.map((char) => ({
          ...char,
          position: INITIAL_POSITIONS[char.id] || { x: 100, y: 100 },
        })),
      }));
    },
    addCharacter: (id, senderId) => {
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
      };
      set((state) => ({ characters: [...state.characters, newCharacter] }));
    },
    removeCharacter: (id, senderId) => {
      if (senderId && id !== senderId) return;
      delete INITIAL_POSITIONS[id];
      set((state) => ({
        characters: state.characters.filter((char) => char.id !== id),
      }));
    },
  })
);

// 6. Create the final store. This code doesn't need to change.
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
