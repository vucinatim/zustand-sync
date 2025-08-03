import { useCallback } from "react";
import * as PIXI from "pixi.js";
import type { Character as CharacterType } from "../common/initializer";

// A PixiJS component for rendering a single character
export const PixiCharacter = ({ character }: { character: CharacterType }) => {
  const colorMap: { [key: string]: number } = {
    "bg-red-400": 0xff1744, // Bright neon red
    "bg-blue-400": 0x00b0ff, // Bright neon blue
    "bg-green-400": 0x00e676, // Bright neon green
    "bg-purple-400": 0xaa00ff, // Bright neon purple
    "bg-pink-400": 0xff4081, // Bright neon pink
    "bg-indigo-400": 0x536dfe, // Bright neon indigo
  };
  const fillColor = colorMap[character.color] || 0xffffff;

  // THE FIX: Updated to modern PixiJS v8 API
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();

      // Draw glow effect (larger, semi-transparent circle)
      g.lineStyle(8, fillColor, 0.3);
      g.beginFill(fillColor, 0.1);
      g.drawCircle(0, 0, 32);
      g.endFill();

      // Draw main character circle
      g.lineStyle(2, 0xffffff, 1);
      g.beginFill(fillColor, 1);
      g.drawCircle(0, 0, 24);
      g.endFill();

      // Draw inner glow
      g.lineStyle(1, 0xffffff, 0.5);
      g.beginFill(fillColor, 0.3);
      g.drawCircle(0, 0, 16);
      g.endFill();
    },
    [fillColor]
  );

  // THE FIX: Wrap Graphics and Text in a Container to resolve the `addChild` warning.
  // The container is now responsible for the position.
  return (
    <pixiContainer x={character.position.x} y={character.position.y}>
      <pixiGraphics draw={draw} />
      <pixiText
        text={character.name}
        anchor={0.5}
        y={-40}
        style={
          new PIXI.TextStyle({
            fill: "white",
            fontSize: 16,
            fontFamily: "Arial, sans-serif",
            stroke: "black",
            fontWeight: "bold",
          })
        }
      />
    </pixiContainer>
  );
};
