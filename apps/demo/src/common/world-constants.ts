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
    y: WORLD_CONSTANTS.HEIGHT,
    width: WORLD_CONSTANTS.WIDTH,
    height: 300,
    color: 0x191919, // Bright neon green
  },
  // Tower platforms going upward - centered in world
  {
    x: 700, // Center-left (was 200)
    y: WORLD_CONSTANTS.HEIGHT - 200,
    width: 200,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00e676, // Bright neon green
  },
  {
    x: 1100, // Center-right (was 600)
    y: WORLD_CONSTANTS.HEIGHT - 350,
    width: 250,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00e676, // Bright neon green
  },
  {
    x: 650, // Left side (was 150)
    y: WORLD_CONSTANTS.HEIGHT - 500,
    width: 150,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00e676, // Bright neon green
  },
  {
    x: 1150, // Right side (was 650)
    y: WORLD_CONSTANTS.HEIGHT - 650,
    width: 200,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00e676, // Bright neon green
  },
  {
    x: 600, // Far left (was 100)
    y: WORLD_CONSTANTS.HEIGHT - 800,
    width: 180,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00e676, // Bright neon green
  },
  {
    x: 1200, // Far right (was 700)
    y: WORLD_CONSTANTS.HEIGHT - 950,
    width: 220,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00e676, // Bright neon green
  },
  {
    x: 800, // Center-left (was 300)
    y: WORLD_CONSTANTS.HEIGHT - 1100,
    width: 200,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00e676, // Bright neon green
  },
  {
    x: 1000, // Center-right (was 500)
    y: WORLD_CONSTANTS.HEIGHT - 1250,
    width: 150,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00e676, // Bright neon green
  },
  {
    x: 550, // Very far left (was 50)
    y: WORLD_CONSTANTS.HEIGHT - 1400,
    width: 250,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00e676, // Bright neon green
  },
  {
    x: 1250, // Very far right (was 750)
    y: WORLD_CONSTANTS.HEIGHT - 1550,
    width: 200,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00e676, // Bright neon green
  },
  {
    x: 750, // Left side (was 250)
    y: WORLD_CONSTANTS.HEIGHT - 1700,
    width: 180,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00e676, // Bright neon green
  },
  {
    x: 1100, // Right side (was 600)
    y: WORLD_CONSTANTS.HEIGHT - 1850,
    width: 220,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00e676, // Bright neon green
  },
  {
    x: 900, // Center (was 400)
    y: WORLD_CONSTANTS.HEIGHT - 2000,
    width: 200,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00e676, // Bright neon green
  },
  {
    x: 600, // Left side (was 100)
    y: WORLD_CONSTANTS.HEIGHT - 2150,
    width: 150,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00e676, // Bright neon green
  },
  {
    x: 1200, // Right side (was 700)
    y: WORLD_CONSTANTS.HEIGHT - 2300,
    width: 250,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00e676, // Bright neon green
  },
  {
    x: 850, // Center-left (was 350)
    y: WORLD_CONSTANTS.HEIGHT - 2450,
    width: 200,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00e676, // Bright neon green
  },
  {
    x: 1050, // Center-right (was 550)
    y: WORLD_CONSTANTS.HEIGHT - 2600,
    width: 180,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00e676, // Bright neon green
  },
  {
    x: 700, // Left side (was 200)
    y: WORLD_CONSTANTS.HEIGHT - 2750,
    width: 220,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00e676, // Bright neon green
  },
  // Moving platforms for added challenge - centered
  {
    x: 650, // Left side (was 150)
    y: WORLD_CONSTANTS.HEIGHT - 900, // Unique Y position
    width: 200,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00b0ff, // Bright neon blue for moving platforms
    moveSpeed: 0.5, // Slow movement
    moveRange: 100, // Move 100 pixels left and right
  },
  {
    x: 1150, // Right side (was 650)
    y: WORLD_CONSTANTS.HEIGHT - 1500, // Unique Y position
    width: 250,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00b0ff, // Bright neon blue for moving platforms
    moveSpeed: 0.8, // Medium movement
    moveRange: 150, // Move 150 pixels left and right
  },
  {
    x: 800, // Center-left (was 300)
    y: WORLD_CONSTANTS.HEIGHT - 2100, // Unique Y position
    width: 200,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0x00b0ff, // Bright neon blue for moving platforms
    moveSpeed: 1.2, // Fast movement
    moveRange: 200, // Move 200 pixels left and right
  },
  // Goal platform at the top
  {
    x: WORLD_CONSTANTS.WIDTH / 2 - 150,
    y: WORLD_CONSTANTS.HEIGHT - 2900,
    width: 300,
    height: WORLD_CONSTANTS.PLATFORM_HEIGHT,
    color: 0xffd600, // Bright neon yellow for goal
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
