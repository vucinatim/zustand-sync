import { useEffect, useRef } from "react";
import { useTick } from "@pixi/react";
import { useGameStore, useUIStore } from "../common/store";
import { PHYSICS_CONSTANTS } from "../common/physics-constants";

// Game Logic Controller Component
export const GameController = () => {
  const clientId = useGameStore((state) => state.clientId);
  const actions = useGameStore((state) => state.actions);
  const inputs = useRef({ left: false, right: false });
  const lastSyncTime = useRef(performance.now());

  useTick((ticker) => {
    const delta = ticker.deltaTime;

    if (!clientId) return;

    const myCharacter = useGameStore
      .getState()
      .characters.find((c) => c.id === clientId);
    if (!myCharacter) return;

    // --- IDLE CHECK: If doing nothing on the ground, skip physics ---
    if (
      myCharacter.isOnGround &&
      myCharacter.velocity.x === 0 &&
      myCharacter.velocity.y === 0 &&
      !inputs.current.left &&
      !inputs.current.right
    ) {
      return;
    }

    const newVelocity = { ...myCharacter.velocity };
    if (inputs.current.left) newVelocity.x = -PHYSICS_CONSTANTS.MOVE_SPEED;
    else if (inputs.current.right) newVelocity.x = PHYSICS_CONSTANTS.MOVE_SPEED;
    else newVelocity.x = 0;
    newVelocity.y += PHYSICS_CONSTANTS.GRAVITY * delta;

    const newPosition = {
      x: myCharacter.position.x + newVelocity.x * delta,
      y: myCharacter.position.y + newVelocity.y * delta,
    };

    let newIsOnGround = false;
    const platforms = [
      {
        x: 0,
        y: window.innerHeight - 50,
        width: window.innerWidth,
        height: 50,
      },
      { x: 200, y: window.innerHeight - 150, width: 200, height: 20 },
      { x: 500, y: window.innerHeight - 250, width: 250, height: 20 },
      { x: 50, y: window.innerHeight - 350, width: 150, height: 20 },
    ];
    for (const platform of platforms) {
      if (
        newPosition.x > platform.x - 12 &&
        newPosition.x < platform.x + platform.width + 12 &&
        newPosition.y >= platform.y - 24 &&
        myCharacter.position.y < platform.y
      ) {
        newPosition.y = platform.y - 24;
        newVelocity.y = 0;
        newIsOnGround = true;
        break;
      }
    }

    if (newPosition.x < 24) newPosition.x = 24;
    if (newPosition.x > window.innerWidth - 24)
      newPosition.x = window.innerWidth - 24;

    // THE FIX: Check if the state has meaningfully changed before dispatching.
    // We use small thresholds to avoid floating point inaccuracies.
    const hasStateChanged =
      Math.abs(myCharacter.position.x - newPosition.x) > 0.1 ||
      Math.abs(myCharacter.position.y - newPosition.y) > 0.1 ||
      Math.abs(myCharacter.velocity.x - newVelocity.x) > 0.1 ||
      Math.abs(myCharacter.velocity.y - newVelocity.y) > 0.1 ||
      myCharacter.isOnGround !== newIsOnGround;

    const now = performance.now();
    if (
      hasStateChanged &&
      now - lastSyncTime.current > PHYSICS_CONSTANTS.SYNC_INTERVAL
    ) {
      lastSyncTime.current = now;
      console.log("CLIENT: Sending updatePlayerState");
      actions.updatePlayerState(
        clientId,
        newPosition,
        newVelocity,
        newIsOnGround
      );
    }
  });

  useEffect(() => {
    if (!clientId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === "ArrowLeft") inputs.current.left = true;
      if (e.key === "ArrowRight") inputs.current.right = true;
      if (e.key === " " || e.key === "ArrowUp") actions.jump(clientId);
      if (e.key === "c") actions.cycleMyColor();
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
