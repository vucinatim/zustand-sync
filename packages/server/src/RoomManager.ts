/* eslint-disable @typescript-eslint/no-explicit-any */
import { StoreController, type ControllerOptions } from "./StoreController";
import type { ServerConfig } from "./factory";
import type { Server as SocketIoServer } from "socket.io"; // 1. Import Socket.IO Server type

export class RoomManager {
  private rooms: Map<string, StoreController<any>> = new Map();
  private initializer: ServerConfig["initializer"];
  private controllerOptions: ControllerOptions;
  private io: SocketIoServer; // 2. Add a property to hold the io instance

  constructor(
    io: SocketIoServer, // 3. Accept the io instance in the constructor
    initializer: ServerConfig["initializer"],
    options: ControllerOptions
  ) {
    this.io = io; // 4. Store the io instance
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

      // 5. THE FIX: Listen for the 'state-changed' event from the controller.
      // When it fires, use the stored `io` instance to broadcast the patches.
      newController.on("state-changed", (patches) => {
        this.io.to(roomId).emit("server:patch", patches);
      });

      this.rooms.set(roomId, newController);
    }
    return this.rooms.get(roomId)!;
  }

  public getRoom(roomId: string): StoreController<any> | undefined {
    return this.rooms.get(roomId);
  }

  public cleanup(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.cleanup(); // Call the controller's cleanup method
      console.log(`[RoomManager] Room ${roomId} is empty. Destroying.`);
      this.rooms.delete(roomId);
    }
  }
}
