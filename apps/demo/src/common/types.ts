// apps/demo/src/common/types.ts

// These types are specific to our demo application.

export interface CharacterInput {
  left: boolean;
  right: boolean;
  jump: boolean; // We can handle jump intent here too
}

export interface Character {
  id: string;
  name: string;
  color: string;
  position: { x: number; y: number };
  // --- NEW PROPERTIES ---
  velocity: { x: number; y: number };
  isOnGround: boolean;
  lastMoveTimestamp: number; // For server validation
  inputs: CharacterInput; // <-- NEW PROPERTY
}

// The GameState interface is now defined in store.ts to keep it close to the implementation
// This file now only contains the Character type and any other shared types
