import { useCallback } from "react";
import * as PIXI from "pixi.js";
import { useGameStore } from "../common/store";

// A PixiJS component for rendering the platforms and game world
export const GameScene = () => {
  const platforms = useGameStore((state) => state.platforms);

  // THE FIX: Updated to modern PixiJS v8 API
  const drawPlatform = useCallback(
    (
      g: PIXI.Graphics,
      platform: {
        x: number;
        y: number;
        width: number;
        height: number;
        color: number;
      }
    ) => {
      g.clear();
      g.rect(0, 0, platform.width, platform.height); // 1. Define the shape
      g.fill(platform.color); // 2. Fill it
    },
    []
  );

  return (
    <pixiContainer>
      {/* Render Platforms */}
      {platforms.map((platform) => (
        <pixiGraphics
          key={platform.id}
          draw={(g) =>
            drawPlatform(g, {
              x: platform.currentX || platform.x,
              y: platform.y,
              width: platform.width,
              height: platform.height,
              color: platform.color,
            })
          }
          x={platform.currentX || platform.x}
          y={platform.y}
        />
      ))}
    </pixiContainer>
  );
};
