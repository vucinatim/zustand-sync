/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { produce, applyPatches, enablePatches, type Patch } from "immer";
import { io, type Socket } from "socket.io-client";
import type { StateCreator, StoreMutatorIdentifier } from "zustand";
import type { LocalState, SyncedStoreApi } from "@zustand-sync/core";

enablePatches();

export type FrameworkState = LocalState & {
  _socket: Socket | null;
  _roomId: string | null;
  api: SyncedStoreApi;
};

const DEFAULT_ROOM_ID = "default-room";

export const sync =
  <
    TState extends { actions: Record<string, (...args: any[]) => void> },
    Mis extends [StoreMutatorIdentifier, unknown][] = [],
    Mos extends [StoreMutatorIdentifier, unknown][] = []
  >(
    initializer: StateCreator<TState, Mis, Mos>
  ): StateCreator<TState & FrameworkState, Mis, Mos> =>
  (set, get, store) => {
    // This flag ensures the auto-connect logic runs only once.
    let isAutoConnectionTriggered = false;

    const userState = initializer(set as any, get as any, store as any);

    const _connect = (roomId: string) => {
      // This logic remains the same.
      if (get()._socket) {
        if (get()._roomId === roomId) return;
        get()._socket?.disconnect();
      }

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
        const { actions, ...restOfState } = initialState as TState;
        set(restOfState as any);
      });

      newSocket.on("server:patch", (patches: Patch[]) => {
        const isFullReplacement =
          patches.length === 1 &&
          patches[0].op === "replace" &&
          patches[0].path.length === 0;

        if (isFullReplacement) {
          const { actions, ...restOfState } = patches[0].value as TState;
          set(restOfState as any);
        } else {
          set(produce((draft) => applyPatches(draft, patches)));
        }
      });
    };

    const api: SyncedStoreApi = {
      connect: (roomId) => {
        _connect(roomId);
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

    // ===================================================================
    // THE NEW "MAGIC" LOGIC
    // ===================================================================

    // 1. Get a reference to the original subscribe method from the store API.
    const originalSubscribe = store.subscribe;

    // 2. Overwrite the store's subscribe method with our own wrapper.
    store.subscribe = (...args) => {
      // 3. On the VERY FIRST call to subscribe (i.e., the first time a
      //    component uses the store), we trigger our auto-connect logic.
      if (!isAutoConnectionTriggered) {
        _connect(DEFAULT_ROOM_ID);
        isAutoConnectionTriggered = true;
      }

      // 4. Always call the original subscribe to ensure Zustand works normally.
      return originalSubscribe(...args);
    };
    // ===================================================================

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
