/* eslint-disable @typescript-eslint/no-explicit-any */
// src/server/factory.ts

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { StoreController } from "./StoreController";

// Define the configuration object that the user will pass to our factory.
type ServerConfig = {
  // The user MUST provide their store initializer.
  initializer: (set: any, get: any) => any;
  // We can add more options in the future, e.g., corsOptions, port, etc.
};

// This is the factory. It sets up and returns a ready-to-use server instance.
export function createServer(config: ServerConfig) {
  const app = express();
  app.use(cors());
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  // The factory creates a controller instance using the user's provided initializer.
  const roomController = new StoreController(config.initializer);

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    const joinPatches = roomController.dispatch(
      "addCharacter",
      [socket.id],
      socket.id
    );
    socket.emit("initial_state", roomController.getState());
    socket.broadcast.emit("patch", joinPatches);

    socket.on("dispatch_command", (actionName: string, ...args: unknown[]) => {
      const patches = roomController.dispatch(actionName, args, socket.id);
      if (patches.length > 0) {
        console.log(
          `Broadcasting ${patches.length} patches for action: ${actionName}`
        );
        io.emit("patch", patches);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      const leavePatches = roomController.dispatch(
        "removeCharacter",
        [socket.id],
        socket.id
      );
      if (leavePatches.length > 0) {
        socket.broadcast.emit("patch", leavePatches);
      }
    });
  });

  // The factory returns the server instance so the user can start it.
  return { server };
}
