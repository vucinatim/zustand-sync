// World coordinate system constants
export const WORLD_CONSTANTS = {
  // Fixed world dimensions (independent of window size)
  WIDTH: 2000,
  HEIGHT: 3000,

  // Platform dimensions
  PLATFORM_HEIGHT: 20,
  PLATFORM_MIN_WIDTH: 100,
  PLATFORM_MAX_WIDTH: 300,

  // Player dimensions
  PLAYER_RADIUS: 24,

  // Camera/viewport settings
  CAMERA_PADDING: 100, // Extra space around player in viewport
} as const;

// Platform type definition
export type Platform = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  moveSpeed?: number; // Horizontal movement speed (pixels per second)
  moveRange?: number; // How far the platform moves from center
  moveOffset?: number; // Initial offset from center position
};

// Platform definitions for the tower climb level
export const PLATFORMS: Platform[] = [
  // Ground level
  {
    x: 0,
    y: WORLD_CONSTANTS.HEIGHT - 50,
    width: WORLD_CONSTANTS.WIDTH,
    height: 50,
    color: 0x166534,
  },
  // Tower platforms going upward - spread out horizontally
  {
    x: 200, // Left side
    y: WORLD_CONSTANTS.HEIGHT - 200,
    width: 200,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x22c55e,
  },
  {
    x: 600, // Right side
    y: WORLD_CONSTANTS.HEIGHT - 350,
    width: 250,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x22c55e,
  },
  {
    x: 150, // Left side
    y: WORLD_CONSTANTS.HEIGHT - 500,
    width: 150,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x22c55e,
  },
  {
    x: 650, // Right side
    y: WORLD_CONSTANTS.HEIGHT - 650,
    width: 200,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x22c55e,
  },
  {
    x: 100, // Far left
    y: WORLD_CONSTANTS.HEIGHT - 800,
    width: 180,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x22c55e,
  },
  {
    x: 700, // Far right
    y: WORLD_CONSTANTS.HEIGHT - 950,
    width: 220,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x22c55e,
  },
  {
    x: 300, // Center-left
    y: WORLD_CONSTANTS.HEIGHT - 1100,
    width: 200,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x22c55e,
  },
  {
    x: 500, // Center-right
    y: WORLD_CONSTANTS.HEIGHT - 1250,
    width: 150,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x22c55e,
  },
  {
    x: 50, // Very far left
    y: WORLD_CONSTANTS.HEIGHT - 1400,
    width: 250,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x22c55e,
  },
  {
    x: 750, // Very far right
    y: WORLD_CONSTANTS.HEIGHT - 1550,
    width: 200,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x22c55e,
  },
  {
    x: 250, // Left side
    y: WORLD_CONSTANTS.HEIGHT - 1700,
    width: 180,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x22c55e,
  },
  {
    x: 600, // Right side
    y: WORLD_CONSTANTS.HEIGHT - 1850,
    width: 220,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x22c55e,
  },
  {
    x: 400, // Center
    y: WORLD_CONSTANTS.HEIGHT - 2000,
    width: 200,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x22c55e,
  },
  {
    x: 100, // Left side
    y: WORLD_CONSTANTS.HEIGHT - 2150,
    width: 150,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x22c55e,
  },
  {
    x: 700, // Right side
    y: WORLD_CONSTANTS.HEIGHT - 2300,
    width: 250,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x22c55e,
  },
  {
    x: 350, // Center-left
    y: WORLD_CONSTANTS.HEIGHT - 2450,
    width: 200,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x22c55e,
  },
  {
    x: 550, // Center-right
    y: WORLD_CONSTANTS.HEIGHT - 2600,
    width: 180,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x22c55e,
  },
  {
    x: 200, // Left side
    y: WORLD_CONSTANTS.HEIGHT - 2750,
    width: 220,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x22c55e,
  },
  // Moving platforms for added challenge - spread out
  {
    x: 150, // Left side
    y: WORLD_CONSTANTS.HEIGHT - 900, // Unique Y position
    width: 200,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x3b82f6, // Blue for moving platforms
    moveSpeed: 0.5, // Slow movement
    moveRange: 100, // Move 100 pixels left and right
  },
  {
    x: 650, // Right side
    y: WORLD_CONSTANTS.HEIGHT - 1500, // Unique Y position
    width: 250,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x3b82f6, // Blue for moving platforms
    moveSpeed: 0.8, // Medium movement
    moveRange: 150, // Move 150 pixels left and right
  },
  {
    x: 300, // Center-left
    y: WORLD_CONSTANTS.HEIGHT - 2100, // Unique Y position
    width: 200,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x3b82f6, // Blue for moving platforms
    moveSpeed: 1.2, // Fast movement
    moveRange: 200, // Move 200 pixels left and right
  },
  // Goal platform at the top
  {
    x: WORLD_CONSTANTS.WIDTH / 2 - 150,
    y: WORLD_CONSTANTS.HEIGHT - 2900,
    width: 300,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0xfbbf24,
  },
];

// World coordinate system helper functions
export const WORLD_UTILS = {
  // Convert world coordinates to screen coordinates
  worldToScreen: (
    worldX: number,
    worldY: number,
    cameraX: number,
    cameraY: number
  ) => ({
    x: worldX + cameraX,
    y: worldY + cameraY,
  }),

  // Convert screen coordinates to world coordinates
  screenToWorld: (
    screenX: number,
    screenY: number,
    cameraX: number,
    cameraY: number
  ) => ({
    x: screenX - cameraX,
    y: screenY - cameraY,
  }),

  // Check if a world position is within world bounds
  isInWorldBounds: (x: number, y: number) => {
    return (
      x >= 0 &&
      x <= WORLD_CONSTANTS.WIDTH &&
      y >= 0 &&
      y <= WORLD_CONSTANTS.HEIGHT
    );
  },

  // Clamp a position to world bounds
  clampToWorldBounds: (x: number, y: number) => ({
    x: Math.max(0, Math.min(WORLD_CONSTANTS.WIDTH, x)),
    y: Math.max(0, Math.min(WORLD_CONSTANTS.HEIGHT, y)),
  }),

  // Calculate platform position with movement
  getPlatformPosition: (platform: Platform, time: number) => {
    if (!platform.moveSpeed || !platform.moveRange) {
      return { x: platform.x, y: platform.y };
    }

    const centerX = platform.x;
    const offset =
      Math.sin(time * platform.moveSpeed * 0.001) * platform.moveRange;

    return {
      x: centerX + offset,
      y: platform.y,
    };
  },
} as const;
