import { useGameStore } from "../common/store";

// Camera system for following the player
export const useCamera = () => {
  const clientId = useGameStore((state) => state.clientId);
  const characters = useGameStore((state) => state.characters);
  const myCharacter = characters.find((c) => c.id === clientId);

  if (!myCharacter) {
    return { x: 0, y: 0 };
  }

  // Camera follows the player with some offset
  const cameraX = -myCharacter.position.x + window.innerWidth / 2;
  const cameraY = -myCharacter.position.y + window.innerHeight / 2;

  return { x: cameraX, y: cameraY };
};
