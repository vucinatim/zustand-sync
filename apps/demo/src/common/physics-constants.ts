// Physics constants for easy adjustment
export const PHYSICS_CONSTANTS = {
  GRAVITY: 30, // How fast the character falls (higher = faster fall)
  MOVE_SPEED: 30, // How fast the character moves left/right
  JUMP_VELOCITY: -80, // How high the character jumps (more negative = higher jump)
  SYNC_INTERVAL: 33, // Sync frequency in milliseconds
} as const;
