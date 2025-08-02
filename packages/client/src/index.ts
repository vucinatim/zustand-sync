/* eslint-disable @typescript-eslint/no-explicit-any */
import { produce, applyPatches, enablePatches, type Patch } from "immer";
import { io, type Socket } from "socket.io-client";
// 1. Import the necessary types from Zustand
import type { StateCreator, StoreMutatorIdentifier } from "zustand";
import type { LocalState, SyncedStoreApi } from "@zustand-sync/core";

enablePatches();

// This is the state our framework adds to the user's store.
// We export it so users can include it in their final store type.
export type FrameworkState = LocalState & {
  _socket: Socket | null;
  _roomId: string | null;
  api: SyncedStoreApi;
};

// 2. This is the magic. The new, fully generic signature.
export const sync =
  <
    TState extends { actions: Record<string, (...args: any[]) => void> },
    // These generic parameters allow other middleware (like devtools) to be composed with yours.
    Mis extends [StoreMutatorIdentifier, unknown][] = [],
    Mos extends [StoreMutatorIdentifier, unknown][] = []
  >(
    initializer: StateCreator<TState, Mis, Mos>
  ): StateCreator<TState & FrameworkState, Mis, Mos> =>
  (set, get, store) => {
    // `set`, `get`, and `store` are for the final state shape: `TState & FrameworkState`

    // 3. We call the user's initializer.
    // The `store` object is the only part that needs a cast. Its type is "invariant",
    // meaning StoreApi<A> is not compatible with StoreApi<B>. This is the one, minimal,
    // and necessary cast we need to hide inside our library.
    const userState = initializer(set as any, get as any, store as any);

    const api: SyncedStoreApi = {
      connect: (roomId) => {
        if (get()._socket) return;

        const newSocket = io("http://localhost:3001");
        set({ _socket: newSocket, connectionStatus: "connecting" } as any);

        newSocket.on("connect", () => {
          set({
            connectionStatus: "connected",
            clientId: newSocket.id,
            _roomId: roomId,
          } as any);
          newSocket.emit("client:join_room", roomId);
        });

        newSocket.on("disconnect", () => {
          set({
            connectionStatus: "disconnected",
            clientId: null,
            _socket: null,
            _roomId: null,
          } as any);
        });

        newSocket.on("server:initial_state", (initialState) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { actions, ...restOfState } = initialState as TState;
          set(restOfState as any);
        });

        newSocket.on("server:patch", (patches: Patch[]) => {
          const isFullReplacement =
            patches.length === 1 &&
            patches[0].op === "replace" &&
            patches[0].path.length === 0;

          if (isFullReplacement) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { actions, ...restOfState } = patches[0].value as TState;
            set(restOfState as any);
          } else {
            set(produce((draft) => applyPatches(draft, patches)));
          }
        });
      },
      disconnect: () => {
        get()._socket?.disconnect();
      },
    };

    // We wrap the user's actions to add the networking layer.
    const wrappedActions = Object.entries(userState.actions).reduce(
      (acc, [actionName, originalAction]) => {
        const key = actionName as keyof typeof userState.actions;
        acc[key] = (...args: Parameters<typeof originalAction>) => {
          // 1. Run the original action logic for an optimistic update.
          originalAction(...args);

          // 2. Emit the command to the server.
          const { _socket, _roomId } = get();
          if (_socket && _roomId) {
            _socket.emit(
              "client:dispatch_command",
              _roomId,
              actionName,
              ...args
            );
          }
        };
        return acc;
      },
      {} as typeof userState.actions
    );

    // Return the final, combined state object.
    return {
      ...userState,
      actions: wrappedActions,
      connectionStatus: "disconnected",
      clientId: null,
      _socket: null,
      _roomId: null,
      api,
    };
  };
