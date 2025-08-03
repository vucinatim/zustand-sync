import { useEffect, useRef } from "react";
import { useTick } from "@pixi/react";
import { useGameStore, useUIStore } from "../common/store";
import { PHYSICS_CONSTANTS } from "../common/physics-constants";

// Game Logic Controller Component
export const GameController = () => {
  const clientId = useGameStore((state) => state.clientId);
  const actions = useGameStore((state) => state.actions);
  const inputs = useRef({ left: false, right: false });

  useTick((ticker) => {
    const delta = ticker.deltaTime;

    if (!clientId) return;

    const myCharacter = useGameStore
      .getState()
      .characters.find((c) => c.id === clientId);
    if (!myCharacter) return;

    // 1. Handle input and update player velocity
    let targetVelocityX = 0;
    if (inputs.current.left) targetVelocityX = -PHYSICS_CONSTANTS.MOVE_SPEED;
    if (inputs.current.right) targetVelocityX = PHYSICS_CONSTANTS.MOVE_SPEED;

    // If intent has changed, dispatch an action to update velocity
    if (myCharacter.velocity.x !== targetVelocityX) {
      actions.updatePlayerState(
        clientId,
        myCharacter.position,
        { x: targetVelocityX, y: myCharacter.velocity.y },
        myCharacter.isOnGround
      );
    }

    // 2. Run the full simulation for this frame
    actions.tick(delta);
  });

  useEffect(() => {
    if (!clientId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === "ArrowLeft") inputs.current.left = true;
      if (e.key === "ArrowRight") inputs.current.right = true;
      if (e.key === " " || e.key === "ArrowUp") actions.jump(clientId);
      if (e.key === "c") actions.cycleMyColor(clientId);
      if (e.key === "r") actions.resetPositions();
      if (e.key === "i") useUIStore.getState().actions.toggleInstructions();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") inputs.current.left = false;
      if (e.key === "ArrowRight") inputs.current.right = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [clientId, actions]);

  return null;
};
