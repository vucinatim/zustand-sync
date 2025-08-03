/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { RoomManager } from "./RoomManager.js";
import { StoreController } from "./StoreController.js";
import { StoreApi } from "zustand";

export const DEFAULT_SERVER_TICK_RATE = 1000 / 30;

export type ServerConfig = {
  initializer: (set: any, get: any, store: StoreApi<any>) => any;
  serverTick?: (storeController: StoreController<any>) => void;
  serverTickRate?: number;
  serverTickEnabled?: boolean; // NEW: Control server tick system
  debug?: {
    simulatedLatencyMs?: number;
  };
};

export function createServer(config: ServerConfig): {
  server: http.Server;
  app: express.Express;
} {
  const app = express();
  // IMPORTANT: Remove the cors() middleware here.
  // Since server and client are on the same origin, it's not needed
  // and can sometimes cause issues with Socket.IO.
  // app.use(cors());

  const server = http.createServer(app);
  const io = new Server(server); // No CORS needed for same-origin

  // THE FIX: Pass the `io` instance to the RoomManager
  const roomManager = new RoomManager(io, config.initializer, {
    simulatedLatencyMs: config.debug?.simulatedLatencyMs || 0,
    serverTick: config.serverTick,
    serverTickRate: config.serverTickRate || DEFAULT_SERVER_TICK_RATE,
    serverTickEnabled: config.serverTickEnabled !== false, // Default to true if not specified
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.data.roomId = null;

    socket.on("client:join_room", async (roomId: string) => {
      console.log(`Client ${socket.id} attempting to join room ${roomId}`);
      socket.data.roomId = roomId;
      const roomController = roomManager.getOrCreateRoom(roomId);

      await socket.join(roomId);
      roomController.addClient(socket.id);

      await roomController.dispatch("addCharacter", [socket.id], socket.id);
      socket.emit("server:initial_state", roomController.getState());
      // Note: The patches are now broadcast automatically by the 'state-changed' listener
    });

    socket.on(
      "client:dispatch_command",
      async (roomId: string, actionName: string, ...args: unknown[]) => {
        const roomController = roomManager.getRoom(roomId);
        if (!roomController) return;
        // This dispatch will also trigger the 'state-changed' listener,
        // so we don't need to manually broadcast here anymore.
        await roomController.dispatch(actionName, args, socket.id);
      }
    );

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      const roomId = socket.data.roomId;
      if (roomId) {
        const roomController = roomManager.getRoom(roomId);
        if (roomController) {
          roomController.removeClient(socket.id);
          // This dispatch will also trigger the broadcast automatically.
          roomController.dispatchSync(
            "removeCharacter",
            [socket.id],
            socket.id
          );
          if (roomController.getClientCount() === 0) {
            roomManager.cleanup(roomId);
          }
        }
      }
    });
  });

  // Expose both the http server and the express app
  return { server, app };
}
