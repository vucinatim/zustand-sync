import { useCallback } from "react";
import * as PIXI from "pixi.js";

// A PixiJS component for rendering a single enemy
export const PixiEnemy = ({
  enemy,
}: {
  enemy: {
    id: string;
    position: { x: number; y: number };
    type: string;
    health: number;
  };
}) => {
  const enemyColor = enemy.type === "patrol" ? 0xff6b6b : 0xff8e00; // Red for patrol, orange for chase

  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      // Draw enemy as a triangle pointing down
      g.moveTo(0, -20);
      g.lineTo(-15, 10);
      g.lineTo(15, 10);
      g.closePath();
      g.fill(enemyColor);
      g.stroke({ width: 2, color: 0xffffff });
    },
    [enemyColor]
  );

  return (
    <pixiContainer x={enemy.position.x} y={enemy.position.y}>
      <pixiGraphics draw={draw} />
      <pixiText
        text={`Enemy-${enemy.id.substring(0, 4)}`}
        anchor={0.5}
        y={-35}
        style={
          new PIXI.TextStyle({
            fill: "white",
            fontSize: 12,
            fontFamily: "sans-serif",
            stroke: "black",
            fontWeight: "bold",
          })
        }
      />
      {/* Health bar */}
      <pixiGraphics
        draw={(g) => {
          g.clear();
          g.rect(-15, 15, 30, 4);
          g.fill(0x333333);
          g.stroke({ width: 1, color: 0xffffff });
          g.rect(-15, 15, (enemy.health / 100) * 30, 4);
          g.fill(
            enemy.health > 50
              ? 0x22c55e
              : enemy.health > 25
              ? 0xf59e0b
              : 0xef4444
          );
        }}
      />
    </pixiContainer>
  );
};
