import { useCallback } from "react";
import * as PIXI from "pixi.js";
import { useGameStore } from "../common/store";
import { useCamera } from "../hooks/useCamera";

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

      // Draw glow effect (larger, semi-transparent rectangle)
      g.lineStyle(4, platform.color, 0.4);
      g.beginFill(platform.color, 0.1);
      g.drawRect(-2, -2, platform.width + 4, platform.height + 4);
      g.endFill();

      // Draw main platform
      g.lineStyle(2, 0xffffff, 0.8);
      g.beginFill(platform.color, 1);
      g.drawRect(0, 0, platform.width, platform.height);
      g.endFill();

      // Draw inner glow line
      g.lineStyle(1, 0xffffff, 0.6);
      g.moveTo(0, platform.height / 2);
      g.lineTo(platform.width, platform.height / 2);
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

// Background component with world plane and gradient
export const GameBackground = () => {
  const camera = useCamera();

  const drawBackground = useCallback(
    (bgGraphics: PIXI.Graphics) => {
      bgGraphics.clear();

      // Calculate gradient based on camera Y position (higher = brighter)
      const maxHeight = 3000; // World height
      const currentHeight = -camera.y; // Convert negative camera Y to positive height
      const gradientProgress = Math.max(
        0,
        Math.min(1, 1 - currentHeight / maxHeight) // Invert so bottom is black, top is white
      );

      console.log(
        "Camera Y:",
        camera.y,
        "Current Height:",
        currentHeight,
        "Gradient Progress:",
        gradientProgress
      );

      // Create gradient from black to white
      const startColor = 0x000000; // Black
      const endColor = 0xffffff; // White

      // Interpolate color based on height
      const r1 = (startColor >> 16) & 0xff;
      const g1 = (startColor >> 8) & 0xff;
      const b1 = startColor & 0xff;
      const r2 = (endColor >> 16) & 0xff;
      const g2 = (endColor >> 8) & 0xff;
      const b2 = endColor & 0xff;

      const r = Math.round(r1 + (r2 - r1) * gradientProgress);
      const g = Math.round(g1 + (g2 - g1) * gradientProgress);
      const b = Math.round(b1 + (b2 - b1) * gradientProgress);

      const backgroundColor = (r << 16) | (g << 8) | b;

      // Fill background with gradient color
      bgGraphics.beginFill(backgroundColor, 1);
      bgGraphics.drawRect(-camera.x, -camera.y, 2000, 3000);
      bgGraphics.endFill();

      // LAYER 1: Distant stars (very slow parallax - 0.05x camera speed)
      bgGraphics.lineStyle(1, 0x888888, 0.3);
      for (let i = 0; i < 50; i++) {
        const x = (i * 137) % 2000; // Spread stars across width
        const y = (i * 89) % 3000; // Spread stars across height
        const size = 0.5 + (i % 2); // Small stars

        // Very slow parallax - stars barely move
        const parallaxX = x - camera.x * 0.05;
        const parallaxY = y - camera.y * 0.05;

        // Vary star colors slightly
        const starColor =
          i % 3 === 0 ? 0x888888 : i % 3 === 1 ? 0x999999 : 0x777777;

        bgGraphics.beginFill(starColor, 0.4);
        bgGraphics.drawCircle(parallaxX, parallaxY, size);
        bgGraphics.endFill();
      }

      // LAYER 2: Distant mountains (slow parallax - 0.1x camera speed)
      bgGraphics.lineStyle(2, 0x333333, 0.4);
      for (let i = 0; i < 8; i++) {
        const x = i * 250 - 100; // Mountain positions
        const baseY = 2800; // Mountain base
        const height = 200 + (i % 3) * 100; // Vary mountain heights

        // Slow parallax for mountains
        const parallaxX = x - camera.x * 0.1;
        const parallaxY = baseY - camera.y * 0.1;

        // Vary mountain colors
        const mountainColor = i % 2 === 0 ? 0x222222 : 0x1a1a1a;

        // Draw mountain triangle
        bgGraphics.beginFill(mountainColor, 0.6);
        bgGraphics.moveTo(parallaxX, parallaxY);
        bgGraphics.lineTo(parallaxX + 200, parallaxY);
        bgGraphics.lineTo(parallaxX + 100, parallaxY - height);
        bgGraphics.closePath();
        bgGraphics.endFill();
      }

      // LAYER 3: Clouds (medium parallax - 0.2x camera speed)
      bgGraphics.lineStyle(1, 0x555555, 0.3);
      for (let i = 0; i < 15; i++) {
        const x = (i * 133) % 2000; // Spread clouds
        const y = ((i * 67) % 1000) + 500; // Clouds in upper area
        const size = 20 + (i % 3) * 10; // Vary cloud sizes

        // Medium parallax for clouds
        const parallaxX = x - camera.x * 0.2;
        const parallaxY = y - camera.y * 0.2;

        // Vary cloud colors
        const cloudColor = i % 2 === 0 ? 0x555555 : 0x444444;

        // Draw cloud (simple circle)
        bgGraphics.beginFill(cloudColor, 0.2);
        bgGraphics.drawCircle(parallaxX, parallaxY, size);
        bgGraphics.endFill();
      }

      // LAYER 4: World plane grid (moves with camera)
      bgGraphics.lineStyle(1, 0x222222, 0.5);

      // Vertical lines
      for (let x = 0; x <= 2000; x += 100) {
        bgGraphics.moveTo(x - camera.x, -camera.y);
        bgGraphics.lineTo(x - camera.x, 3000 - camera.y);
      }

      // Horizontal lines
      for (let y = 0; y <= 3000; y += 100) {
        bgGraphics.moveTo(-camera.x, y - camera.y);
        bgGraphics.lineTo(2000 - camera.x, y - camera.y);
      }

      // Draw ground plane with more prominent lines
      bgGraphics.lineStyle(2, 0x333333, 0.7);
      bgGraphics.moveTo(-camera.x, 2950 - camera.y);
      bgGraphics.lineTo(2000 - camera.x, 2950 - camera.y);

      // LAYER 5: Atmospheric particles (fast parallax - 0.3x camera speed)
      bgGraphics.lineStyle(1, 0x444444, 0.4);
      for (let i = 0; i < 20; i++) {
        const x = (i * 97) % 2000; // Spread particles across width
        const y = (i * 73) % 3000; // Spread particles across height
        const size = 1 + (i % 3); // Vary particle sizes

        // Fast parallax effect (particles move faster than stars)
        const parallaxX = x - camera.x * 0.3;
        const parallaxY = y - camera.y * 0.3;

        bgGraphics.beginFill(0x444444, 0.3);
        bgGraphics.drawCircle(parallaxX, parallaxY, size);
        bgGraphics.endFill();
      }
    },
    [camera.x, camera.y]
  );

  return <pixiGraphics draw={drawBackground} />;
};
