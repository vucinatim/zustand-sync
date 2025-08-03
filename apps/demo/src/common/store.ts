import { create } from "zustand";
import { sync } from "@zustand-sync/client";
import { gameStoreInitializer } from "./initializer";

const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

// 4. Create the final store.
// We provide our final `GameStore` type to `create`.
// We compose our `synced` middleware with `devtools`.
export const useGameStore = create(
  sync(gameStoreInitializer, {
    serverUrl,
    excludeActions: ["tick"], // <-- THE KEY CHANGE: Exclude tick from networking
  })
);

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
