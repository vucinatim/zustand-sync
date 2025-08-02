// src/framework/framework.ts (FINAL, FOCUSED VERSION)
/* eslint-disable @typescript-eslint/no-explicit-any */

import { create, type StoreApi, type UseBoundStore } from "zustand";
import { applyPatches, enablePatches, type Patch } from "immer";
import { io, type Socket } from "socket.io-client";
import type { LocalState } from "@zustand-sync/core";

enablePatches();

// The framework adds these properties to the user's store.
type FrameworkState = LocalState & { _socket: Socket };

// The factory now takes a single generic, `TState`, representing the user's synced store.
export function createSyncedStore<
  TState extends { actions: Record<string, (...args: any[]) => void> }
>(
  initializer: (
    set: StoreApi<TState>["setState"],
    get: StoreApi<TState>["getState"]
  ) => TState
): UseBoundStore<StoreApi<TState & FrameworkState>> {
  // Return a fully-typed hook

  // The final hook will have the user's state AND our framework's state.
  type TFinalStore = TState & FrameworkState;

  return create<TFinalStore>((set, get) => {
    const socket: Socket = io("http://localhost:3001");

    // Call the user's initializer to get their state and actions blueprint.
    // We pass a "sliced" set function that only operates on the user's part of the state.
    const userState = initializer(set, get);

    // --- Socket Event Listeners ---
    socket.on("connect", () => {
      set({
        connectionStatus: "connected",
        clientId: socket.id,
      } as Partial<TFinalStore>);
    });
    socket.on("disconnect", () => {
      set({
        connectionStatus: "disconnected",
        clientId: null,
      } as Partial<TFinalStore>);
    });
    socket.on("initial_state", (initialState) => {
      // Immerse the incoming state into the existing state object
      // But preserve the actions and framework state
      set((state) => ({
        ...state,
        ...initialState,
        // Preserve the actions and framework state
        actions: state.actions,
        connectionStatus: state.connectionStatus,
        clientId: state.clientId,
        _socket: state._socket,
      }));
    });
    socket.on("patch", (patches: Patch[]) => {
      // The `set` function from Zustand can take a function that receives the previous state.
      // This is the safest way to apply patches.
      set((state) => {
        const patchedState = applyPatches(state, patches);
        // Preserve the actions and framework state
        return {
          ...patchedState,
          actions: state.actions,
          connectionStatus: state.connectionStatus,
          clientId: state.clientId,
          _socket: state._socket,
        };
      });
    });

    // --- Wrap the user's actions to add networking ---
    const wrappedActions = Object.entries(userState.actions).reduce(
      (acc, [actionName, originalAction]) => {
        const key = actionName as keyof typeof userState.actions;
        acc[key] = (...args: Parameters<typeof originalAction>) => {
          originalAction(...args);
          socket.emit("dispatch_command", actionName, ...args);
        };
        return acc;
      },
      {} as typeof userState.actions
    );

    // --- Return the final combined store object ---
    return {
      ...userState,
      actions: wrappedActions,
      // Initialize the framework's part of the state
      connectionStatus: "connecting",
      clientId: null,
      _socket: socket,
    };
  });
}
