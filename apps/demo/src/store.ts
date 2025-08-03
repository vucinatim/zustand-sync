import { create } from "zustand";
import { sync } from "@zustand-sync/client";
import { gameStoreInitializer } from "./common/initializer";

// When the URL is not provided, socket.io-client connects to the host that serves the page.
const serverUrl = import.meta.env.VITE_SERVER_URL || undefined;

// 4. Create the final store.
// We provide our final `GameStore` type to `create`.
// We compose our `synced` middleware with `devtools`.
export const useGameStore = create(
  sync(gameStoreInitializer, {
    serverUrl, // This will be undefined in production, which is correct
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
