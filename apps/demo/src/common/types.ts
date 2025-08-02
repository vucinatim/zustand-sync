// apps/demo/src/common/types.ts (NEW FILE)

// These types are specific to our demo application.
export type Character = {
  id: string;
  position: { x: number; y: number };
  color: string;
  name: string;
};

export type SyncedState = {
  characters: Character[];
};

export type GameState = SyncedState & {
  actions: {
    resetPositions: () => void;
    moveCharacter: (
      characterId: string,
      newPosition: { x: number; y: number },
      senderId?: string
    ) => void;
    addCharacter: (socketId: string) => void;
    removeCharacter: (socketId: string) => void;
  };
};

export type UIState = {
  isInstructionsOpen: boolean;
  actions: {
    toggleInstructions: () => void;
  };
};
