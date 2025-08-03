import { useEffect, useRef } from "react";
import { useTick } from "@pixi/react";
import { useGameStore, useUIStore } from "../store";

// Game Logic Controller Component
export const GameController = () => {
  const clientId = useGameStore((state) => state.clientId);
  const actions = useGameStore((state) => state.actions);

  // This ref is now just for tracking the local key state
  const inputs = useRef({ left: false, right: false });

  // The client-side tick is now PURELY for prediction.
  useTick((ticker) => {
    actions.tick(ticker.deltaMS / 1000);
  });

  useEffect(() => {
    if (!clientId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      switch (e.key) {
        case "ArrowLeft":
          if (!inputs.current.left) {
            // Send only on change
            inputs.current.left = true;
            actions.setInputState(clientId, { left: true });
          }
          break;
        case "ArrowRight":
          if (!inputs.current.right) {
            // Send only on change
            inputs.current.right = true;
            actions.setInputState(clientId, { right: true });
          }
          break;
        case " ":
        case "ArrowUp":
          // Jump is a single event
          actions.setInputState(clientId, { jump: true });
          break;
        case "c":
          actions.cycleMyColor(clientId);
          break;
        case "r":
          actions.resetPositions();
          break;
        case "i":
          useUIStore.getState().actions.toggleInstructions();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          inputs.current.left = false;
          actions.setInputState(clientId, { left: false });
          break;
        case "ArrowRight":
          inputs.current.right = false;
          actions.setInputState(clientId, { right: false });
          break;
        case " ":
        case "ArrowUp":
          // After the jump key is released, ensure the jump input is false
          actions.setInputState(clientId, { jump: false });
          break;
      }
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
