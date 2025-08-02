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
  const enemyColor = enemy.type === "patrol" ? 0xff1744 : 0xff9100; // Bright neon red for patrol, bright neon orange for chase

  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();

      // Draw glow effect (larger, semi-transparent triangle)
      g.lineStyle(6, enemyColor, 0.4);
      g.beginFill(enemyColor, 0.15);
      g.moveTo(0, -26);
      g.lineTo(-19, 14);
      g.lineTo(19, 14);
      g.closePath();
      g.endFill();

      // Draw main enemy triangle
      g.lineStyle(2, 0xffffff, 1);
      g.beginFill(enemyColor, 1);
      g.moveTo(0, -20);
      g.lineTo(-15, 10);
      g.lineTo(15, 10);
      g.closePath();
      g.endFill();

      // Draw inner glow
      g.lineStyle(1, 0xffffff, 0.6);
      g.beginFill(enemyColor, 0.4);
      g.moveTo(0, -16);
      g.lineTo(-12, 8);
      g.lineTo(12, 8);
      g.closePath();
      g.endFill();
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
            fontSize: 14,
            fontFamily: "Arial, sans-serif",
            stroke: "black",
            fontWeight: "bold",
          })
        }
      />
      {/* Health bar */}
      <pixiGraphics
        draw={(g) => {
          g.clear();
          g.lineStyle(1, 0xffffff, 1);
          g.beginFill(0x333333, 1);
          g.drawRect(-15, 15, 30, 4);
          g.endFill();
          g.beginFill(
            enemy.health > 50
              ? 0x22c55e
              : enemy.health > 25
              ? 0xf59e0b
              : 0xef4444,
            1
          );
          g.drawRect(-15, 15, (enemy.health / 100) * 30, 4);
          g.endFill();
        }}
      />
    </pixiContainer>
  );
};
