import { useCallback } from "react";
import * as PIXI from "pixi.js";
import type { Character as CharacterType } from "../common/types";

// A PixiJS component for rendering a single character
export const PixiCharacter = ({ character }: { character: CharacterType }) => {
  const colorMap: { [key: string]: number } = {
    "bg-red-400": 0xef4444,
    "bg-blue-400": 0x3b82f6,
    "bg-green-400": 0x22c55e,
    "bg-purple-400": 0x8b5cf6,
    "bg-pink-400": 0xec4899,
    "bg-indigo-400": 0x6366f1,
  };
  const fillColor = colorMap[character.color] || 0xffffff;

  // THE FIX: Updated to modern PixiJS v8 API
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.circle(0, 0, 24); // 1. Define the shape
      g.fill(fillColor); // 2. Fill it
      g.stroke({ width: 2, color: 0xffffff }); // 3. Stroke it
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
            fontSize: 14,
            fontFamily: "sans-serif",
            stroke: "black",
            fontWeight: "bold",
          })
        }
      />
    </pixiContainer>
  );
};
