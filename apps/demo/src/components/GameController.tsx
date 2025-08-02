import { useEffect, useRef } from "react";
import { useTick } from "@pixi/react";
import { useGameStore, useUIStore } from "../common/store";
import { PHYSICS_CONSTANTS } from "../common/physics-constants";
import { WORLD_CONSTANTS, WORLD_UTILS } from "../common/world-constants";

// Game Logic Controller Component
export const GameController = () => {
  const clientId = useGameStore((state) => state.clientId);
  const actions = useGameStore((state) => state.actions);
  const platforms = useGameStore((state) => state.platforms);
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
    // BUT: We still need to check for platform movement that might cause falling
    const isIdle =
      myCharacter.isOnGround &&
      myCharacter.velocity.x === 0 &&
      myCharacter.velocity.y === 0 &&
      !inputs.current.left &&
      !inputs.current.right;

    // Always run collision detection, even when idle
    let newVelocity = { ...myCharacter.velocity };
    let newPosition = { ...myCharacter.position };
    let newIsOnGround = false;

    // Only update velocity and position if not idle
    if (!isIdle) {
      if (inputs.current.left) newVelocity.x = -PHYSICS_CONSTANTS.MOVE_SPEED;
      else if (inputs.current.right)
        newVelocity.x = PHYSICS_CONSTANTS.MOVE_SPEED;
      else newVelocity.x = 0;
      newVelocity.y += PHYSICS_CONSTANTS.GRAVITY * delta;

      newPosition = {
        x: myCharacter.position.x + newVelocity.x * delta,
        y: myCharacter.position.y + newVelocity.y * delta,
      };
    }

    // Use server-controlled platforms for collision detection
    for (const platform of platforms) {
      const platformX = platform.currentX || platform.x;

      if (
        newPosition.x > platformX - WORLD_CONSTANTS.PLAYER_RADIUS &&
        newPosition.x <
          platformX + platform.width + WORLD_CONSTANTS.PLAYER_RADIUS &&
        newPosition.y >= platform.y - WORLD_CONSTANTS.PLAYER_RADIUS &&
        myCharacter.position.y < platform.y
      ) {
        newPosition.y = platform.y - WORLD_CONSTANTS.PLAYER_RADIUS;
        newVelocity.y = 0;
        newIsOnGround = true;
        break;
      }
    }

    // Check if player was on ground but is no longer supported by any platform
    if (myCharacter.isOnGround && !newIsOnGround) {
      // Player was on ground but is no longer supported - start falling
      newVelocity.y = 0; // Start with zero velocity, gravity will take over
    }

    // Clamp position to world bounds
    const clampedPosition = WORLD_UTILS.clampToWorldBounds(
      newPosition.x,
      newPosition.y
    );
    newPosition.x = clampedPosition.x;
    newPosition.y = clampedPosition.y;

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
