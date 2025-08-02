import { create } from "zustand";
import { sync, type FrameworkState } from "@zustand-sync/client";
import type { Character } from "./types";
import type { StateCreator } from "zustand";

// 1. Define the user's state and actions as if it were a normal store.
// Notice there is no mention of `FrameworkState` here.
interface GameState {
  characters: Character[];
  actions: {
    moveCharacter: (
      characterId: string,
      position: { x: number; y: number }
    ) => void;
    cycleMyColor: () => void;
    resetPositions: () => void;
    addCharacter: (id: string, senderId?: string) => void;
    removeCharacter: (id: string, senderId?: string) => void;
  };
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
const gameStoreInitializer: StateCreator<GameState, [], [], GameState> = (
  set,
  get
) => ({
  characters: [],
  actions: {
    moveCharacter: (characterId, position) => {
      set((state) => ({
        characters: state.characters.map((char) =>
          char.id === characterId ? { ...char, position } : char
        ),
      }));
    },
    cycleMyColor: () => {
      // Our middleware ensures `get()` inside an action has access to the full state.
      const myId = (get() as GameStore).clientId;
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
  },
});

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
