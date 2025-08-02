// src/common/types.ts
export type Character = {
  id: string;
  position: { x: number; y: number };
  color: string;
  name: string;
};

export type SyncedState = {
  characters: Character[];
};

export type LocalState = {
  connectionStatus: "connected" | "disconnected" | "connecting";
  clientId: string | null;
};
