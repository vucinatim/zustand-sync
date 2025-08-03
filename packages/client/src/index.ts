/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { produce, applyPatches, enablePatches, type Patch } from "immer";
import { io } from "socket.io-client";
import type { Socket as IoSocket } from "socket.io-client";
import type { StateCreator, StoreApi, StoreMutatorIdentifier } from "zustand";
import type { LocalState, SyncedStoreApi } from "@zustand-sync/core";

/** Re-export a *portable* alias that points at the public module path. */
export type Socket = IoSocket;

/** Keep implementation details private. */
type InternalSocket = IoSocket;

enablePatches();

export type FrameworkState = LocalState & {
  _socket: InternalSocket | null;
  _roomId: string | null;
  api: SyncedStoreApi;
};

const DEFAULT_ROOM_ID = "default-room";

export type SyncOptions = {
  serverUrl?: string;
  excludeActions?: string[]; // <-- NEW: Actions that should not be sent over the network
};

export const sync =
  <
    // THE FIX: The constraint is relaxed to only require an `actions` object.
    // This accepts interfaces like `GameActions` without issue.
    TState extends { actions: object },
    Mis extends [StoreMutatorIdentifier, unknown][] = [],
    Mos extends [StoreMutatorIdentifier, unknown][] = []
  >(
    initializer: StateCreator<TState, Mis, Mos>,
    options?: SyncOptions
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

      const newSocket = io(options?.serverUrl || "http://localhost:3001");
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

    // THE FIX: Use a for...in loop and a type assertion internally
    // to safely wrap the user's actions without a strict external constraint.
    const userActions = userState.actions as Record<
      string,
      (...args: any[]) => any
    >;
    const wrappedActions = {} as typeof userState.actions;

    for (const actionName in userActions) {
      const originalAction = userActions[actionName];

      // Check if the action is excluded from networking
      if (options?.excludeActions?.includes(actionName)) {
        // This is a local-only action. Just call the original function.
        (wrappedActions as any)[actionName] = (
          ...args: Parameters<typeof originalAction>
        ) => {
          originalAction(...args);
        };
      } else {
        // This is a networked action. Keep the existing logic.
        (wrappedActions as any)[actionName] = (
          ...args: Parameters<typeof originalAction>
        ) => {
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
      }
    }

    const originalSubscribe = store.subscribe;
    store.subscribe = (...args) => {
      if (!isAutoConnectionTriggered) {
        _connect(DEFAULT_ROOM_ID);
        isAutoConnectionTriggered = true;
      }
      return originalSubscribe(...args);
    };

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

type ActionCreator<TState, TActions extends object> = (
  set: StoreApi<TState & { actions: TActions } & FrameworkState>["setState"],
  get: StoreApi<TState & { actions: TActions } & FrameworkState>["getState"],
  store: StoreApi<TState & { actions: TActions } & FrameworkState>
) => TActions;

export function createInitializer<
  TState extends object,
  TActions extends object
>(
  initialState: TState,
  createActions: ActionCreator<TState, TActions>
): StateCreator<TState & { actions: TActions }> {
  // THE FIX: We cast the arguments passed to the user's function.
  // This is the bridge that tells TypeScript: "Trust us, when this
  // function is actually called by the `sync` middleware, `get` and `store`
  // will have the full state shape."
  return (set, get, store) => ({
    ...initialState,
    actions: createActions(set as any, get as any, store as any),
  });
}
