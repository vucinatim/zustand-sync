import { useCallback } from "react";
import * as PIXI from "pixi.js";

// A PixiJS component for rendering the platforms and game world
export const GameScene = () => {
  const platforms = [
    {
      x: 0,
      y: window.innerHeight - 50,
      width: window.innerWidth,
      height: 50,
      color: 0x166534,
    },
    {
      x: 200,
      y: window.innerHeight - 150,
      width: 200,
      height: 20,
      color: 0x22c55e,
    },
    {
      x: 500,
      y: window.innerHeight - 250,
      width: 250,
      height: 20,
      color: 0x22c55e,
    },
    {
      x: 50,
      y: window.innerHeight - 350,
      width: 150,
      height: 20,
      color: 0x22c55e,
    },
  ];

  // THE FIX: Updated to modern PixiJS v8 API
  const drawPlatform = useCallback(
    (g: PIXI.Graphics, platform: (typeof platforms)[0]) => {
      g.clear();
      g.rect(0, 0, platform.width, platform.height); // 1. Define the shape
      g.fill(platform.color); // 2. Fill it
    },
    []
  );

  return (
    <pixiContainer>
      {/* Render Platforms */}
      {platforms.map((platform, i) => (
        <pixiGraphics
          key={i}
          draw={(g) => drawPlatform(g, platform)}
          x={platform.x}
          y={platform.y}
        />
      ))}
    </pixiContainer>
  );
};
