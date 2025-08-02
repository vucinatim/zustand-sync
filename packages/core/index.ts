// packages/core/index.ts (REVISED - FRAMEWORK ONLY)

// These are types that the framework provides to any application.
export type LocalState = {
  connectionStatus: "connected" | "disconnected" | "connecting";
  clientId: string | null;
};

// In the future, we would add other framework-level types here, for example:
/*
export interface PersistenceAdapter<TState> {
  saveState(roomId: string, state: TState): Promise<void>;
  loadState(roomId: string): Promise<TState | null>;
}
*/
