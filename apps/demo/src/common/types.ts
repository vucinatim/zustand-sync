// apps/demo/src/common/types.ts

// These types are specific to our demo application.
export type Character = {
  id: string;
  position: { x: number; y: number };
  color: string;
  name: string;
};

// The GameState interface is now defined in store.ts to keep it close to the implementation
// This file now only contains the Character type and any other shared types
