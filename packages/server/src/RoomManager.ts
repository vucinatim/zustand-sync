/* eslint-disable @typescript-eslint/no-explicit-any */
import { StoreController, type ControllerOptions } from "./StoreController";
import type { ServerConfig } from "./factory";

export class RoomManager {
  private rooms: Map<string, StoreController<any>> = new Map();
  private initializer: ServerConfig["initializer"];
  private controllerOptions: ControllerOptions;

  constructor(
    initializer: ServerConfig["initializer"],
    options: ControllerOptions
  ) {
    this.initializer = initializer;
    this.controllerOptions = options;
  }

  public getOrCreateRoom(roomId: string): StoreController<any> {
    if (!this.rooms.has(roomId)) {
      console.log(`[RoomManager] Creating new room: ${roomId}`);
      const newController = new StoreController(
        this.initializer,
        this.controllerOptions
      );
      this.rooms.set(roomId, newController);
    }
    return this.rooms.get(roomId)!;
  }

  public getRoom(roomId: string): StoreController<any> | undefined {
    return this.rooms.get(roomId);
  }

  public cleanup(roomId: string): void {
    console.log(`[RoomManager] Room ${roomId} is empty. Destroying.`);
    this.rooms.delete(roomId);
  }
}
