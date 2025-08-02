// src/common/store.ts (FINALIZED BLUEPRINT)
/* eslint-disable @typescript-eslint/no-explicit-any */

import { produce } from "immer";
import { create } from "zustand"; // Import the original `create`
import { createSyncedStore } from "@zustand-sync/client";
import type { GameState, UIState } from "./types";

// 1. Define the initializer function. This is our complete isomorphic blueprint.
export const gameStoreInitializer = (set: any) => ({
  characters: [],
  actions: {
    // --- Actions triggered by server events ---
    addCharacter: (socketId: string) => {
      set(
        produce((draft: any) => {
          draft.characters.push({
            id: socketId,
            name: `Player-${socketId.substring(0, 4)}`,
            color: `bg-${
              ["red", "blue", "green", "yellow", "purple", "pink"][
                Math.floor(Math.random() * 6)
              ]
            }-400`,
            position: {
              x: Math.floor(Math.random() * 700) + 50,
              y: Math.floor(Math.random() * 500) + 50,
            },
          });
        })
      );
    },
    removeCharacter: (socketId: string) => {
      set(
        produce((draft: GameState) => {
          const index = draft.characters.findIndex((c) => c.id === socketId);
          if (index !== -1) draft.characters.splice(index, 1);
        })
      );
    },

    // --- Actions triggered by client commands ---
    resetPositions: () => {
      set({ characters: [] });
    },
    moveCharacter: (
      characterId: string,
      newPosition: { x: number; y: number },
      // `senderId` is ONLY provided by the server during dispatch
      senderId?: string
    ) => {
      set(
        produce((draft: GameState) => {
          // --- SERVER-SIDE AUTHORIZATION LOGIC ---
          // This check will only run on the server because the client never provides a senderId.
          if (senderId && senderId !== characterId) {
            console.warn(
              `SECURITY: Client ${senderId} tried to move character ${characterId}. Denied.`
            );
            return; // Abort the mutation
          }
          // --- END AUTHORIZATION ---

          const char = draft.characters.find((c) => c.id === characterId);
          if (char) char.position = newPosition;
        })
      );
    },
  },
});

// --- 1. Define the Synced Store ---
// The generic parameter defines the shape of our synced state and actions.
// The client store uses the same initializer but without the server-specific actions
export const useGameStore = createSyncedStore<GameState>(gameStoreInitializer);

// --- 2. Define a Standard Zustand Store for Local UI State ---

export const useUIStore = create<UIState>((set) => ({
  isInstructionsOpen: true,
  actions: {
    toggleInstructions: () =>
      set((state) => ({ isInstructionsOpen: !state.isInstructionsOpen })),
  },
}));
