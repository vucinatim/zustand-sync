/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create, type StoreApi, type UseBoundStore } from "zustand";
import { produce, applyPatches, enablePatches, type Patch } from "immer";
import { io, type Socket } from "socket.io-client";
import type { LocalState, SyncedStoreApi } from "@zustand-sync/core";

enablePatches();

type FrameworkState = LocalState & {
  _socket: Socket | null;
  _roomId: string | null;
  api: SyncedStoreApi;
};

export function createSyncedStore<
  TState extends { actions: Record<string, (...args: any[]) => void> }
>(
  initializer: (
    set: StoreApi<TState>["setState"],
    get: StoreApi<TState>["getState"]
  ) => TState
): UseBoundStore<StoreApi<TState & FrameworkState>> {
  type TFinalStore = TState & FrameworkState;

  return create<TFinalStore>((set, get) => {
    const userState = initializer(set, get);

    const api: SyncedStoreApi = {
      connect: (roomId) => {
        if (get()._socket) return;

        const newSocket = io("http://localhost:3001");
        set({
          _socket: newSocket,
          connectionStatus: "connecting",
        } as Partial<TFinalStore>);

        newSocket.on("connect", () => {
          set({
            connectionStatus: "connected",
            clientId: newSocket.id,
            _roomId: roomId,
          } as Partial<TFinalStore>);
          newSocket.emit("client:join_room", roomId);
        });

        newSocket.on("disconnect", () => {
          set({
            connectionStatus: "disconnected",
            clientId: null,
            _socket: null,
            _roomId: null,
          } as Partial<TFinalStore>);
        });

        newSocket.on("server:initial_state", (initialState) => {
          // Destructure the incoming state to separate the (non-serializable) actions
          // from the actual state data we want to apply.
          const { actions, ...restOfState } = initialState as TState;
          console.log("Preserved actions:", actions);

          set((state) => ({
            ...state, // Keep the client's existing state (like api, _socket, and wrapped actions)
            ...restOfState, // Apply only the state data from the server
          }));
        });

        newSocket.on("server:patch", (patches: Patch[]) => {
          // A "full replacement" patch looks like this:
          const isFullReplacement =
            patches.length === 1 &&
            patches[0].op === "replace" &&
            patches[0].path.length === 0;

          if (isFullReplacement) {
            console.warn(
              "Received a full-state replacement patch. Merging carefully."
            );
            const { actions, ...restOfState } = patches[0].value as TState;

            set((state) => ({
              ...state,
              ...restOfState,
            }));
          } else {
            // This is for normal, incremental patches
            set(
              produce((draft) => {
                applyPatches(draft, patches);
              })
            );
          }
        });
      },
      disconnect: () => {
        get()._socket?.disconnect();
      },
    };

    const wrappedActions = Object.entries(userState.actions).reduce(
      (acc, [actionName, originalAction]) => {
        const key = actionName as keyof typeof userState.actions;
        acc[key] = (...args: Parameters<typeof originalAction>) => {
          originalAction(...args);
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

    return {
      ...userState,
      actions: wrappedActions,
      connectionStatus: "disconnected",
      clientId: null,
      _socket: null,
      _roomId: null,
      api,
    };
  });
}
