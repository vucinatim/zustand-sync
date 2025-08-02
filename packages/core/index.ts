// packages/core/index.ts (REVISED - FRAMEWORK ONLY)

// These are types that the framework provides to any application.
export type LocalState = {
  connectionStatus: "connected" | "disconnected" | "connecting";
  clientId: string | null;
};

// NEW: The imperative API exposed on the store for connecting/disconnecting
export type SyncedStoreApi = {
  connect: (roomId: string) => void;
  disconnect: () => void;
};
