/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { RoomManager } from "./RoomManager";
import { StoreApi } from "zustand";

export type ServerConfig = {
  initializer: (set: any, get: any, store: StoreApi<any>) => any;
  debug?: {
    simulatedLatencyMs?: number;
  };
};

export function createServer(config: ServerConfig) {
  const app = express();
  app.use(cors());
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  const roomManager = new RoomManager(config.initializer, {
    simulatedLatencyMs: config.debug?.simulatedLatencyMs || 0,
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // This is a standard pattern for associating data with a socket
    socket.data.roomId = null;

    socket.on("client:join_room", async (roomId: string) => {
      console.log(`Client ${socket.id} attempting to join room ${roomId}`);
      socket.data.roomId = roomId;
      const roomController = roomManager.getOrCreateRoom(roomId);

      await socket.join(roomId);
      roomController.addClient(socket.id);

      const joinPatches = await roomController.dispatch(
        "addCharacter",
        [socket.id],
        socket.id
      );

      socket.emit("server:initial_state", roomController.getState());
      socket.to(roomId).emit("server:patch", joinPatches);
    });

    socket.on(
      "client:dispatch_command",
      async (roomId: string, actionName: string, ...args: unknown[]) => {
        const roomController = roomManager.getRoom(roomId);
        if (!roomController) return;

        const patches = await roomController.dispatch(
          actionName,
          args,
          socket.id
        );
        if (patches.length > 0) {
          io.to(roomId).emit("server:patch", patches);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      const roomId = socket.data.roomId;
      if (roomId) {
        const roomController = roomManager.getRoom(roomId);
        if (roomController) {
          roomController.removeClient(socket.id);
          const leavePatches = roomController.dispatchSync(
            "removeCharacter",
            [socket.id],
            socket.id
          );

          if (leavePatches.length > 0) {
            socket.to(roomId).emit("server:patch", leavePatches);
          }

          if (roomController.getClientCount() === 0) {
            roomManager.cleanup(roomId);
          }
        }
      }
    });
  });

  return { server };
}
