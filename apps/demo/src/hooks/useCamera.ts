import { useMemo, useRef, useEffect } from "react";
import { useGameStore } from "../common/store";

export const useCamera = () => {
  const clientId = useGameStore((state) => state.clientId);
  const characters = useGameStore((state) => state.characters);
  const cameraRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(performance.now());
  const targetCameraRef = useRef({ x: 0, y: 0 });

  // Calculate target camera position based on player
  const targetCamera = useMemo(() => {
    if (!clientId) return { x: 0, y: 0 };

    const myCharacter = characters.find((c) => c.id === clientId);
    if (!myCharacter) return { x: 0, y: 0 };

    // Camera dead zone - player can move in this area without camera following
    const deadZoneWidth = 200; // pixels
    const deadZoneHeight = 150; // pixels

    // Get current camera position
    const currentCameraX = cameraRef.current.x;
    const currentCameraY = cameraRef.current.y;

    // Calculate where player would be on screen with current camera
    const playerScreenX = myCharacter.position.x - currentCameraX;
    const playerScreenY = myCharacter.position.y - currentCameraY;

    // Check if player is outside dead zone
    const halfDeadZoneWidth = deadZoneWidth / 2;
    const halfDeadZoneHeight = deadZoneHeight / 2;
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;

    let targetCameraX = currentCameraX;
    let targetCameraY = currentCameraY;

    // Only move camera if player is outside dead zone
    if (Math.abs(playerScreenX - screenCenterX) > halfDeadZoneWidth) {
      // Player is outside horizontal dead zone - move camera
      const sign = playerScreenX > screenCenterX ? 1 : -1;
      targetCameraX =
        myCharacter.position.x - (screenCenterX + sign * halfDeadZoneWidth);
    }

    if (Math.abs(playerScreenY - screenCenterY) > halfDeadZoneHeight) {
      // Player is outside vertical dead zone - move camera
      const sign = playerScreenY > screenCenterY ? 1 : -1;
      targetCameraY =
        myCharacter.position.y - (screenCenterY + sign * halfDeadZoneHeight);
    }

    // Allow camera to move freely to center the player
    // Don't clamp to world bounds since we want smooth following
    const finalTargetX = targetCameraX;
    const finalTargetY = targetCameraY;

    return { x: finalTargetX, y: finalTargetY };
  }, [clientId, characters]);

  // Update target camera reference
  targetCameraRef.current = targetCamera;

  // Continuous easing animation that runs every frame
  useEffect(() => {
    let animationId: number;

    const animateCamera = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Easing factor (0 = no movement, 1 = instant movement)
      const easingFactor = Math.min(deltaTime / 16.67, 1) * 0.1;

      // Interpolate camera position
      const easedX =
        cameraRef.current.x +
        (targetCameraRef.current.x - cameraRef.current.x) * easingFactor;
      const easedY =
        cameraRef.current.y +
        (targetCameraRef.current.y - cameraRef.current.y) * easingFactor;

      // Update camera reference
      cameraRef.current = { x: easedX, y: easedY };

      animationId = requestAnimationFrame(animateCamera);
    };

    animateCamera();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return {
    x: -cameraRef.current.x,
    y: -cameraRef.current.y,
  };
};
