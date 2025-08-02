/* eslint-disable @typescript-eslint/no-explicit-any */
// src/server/factory.ts (REVISED)

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { StoreController } from "./StoreController";

// --- NEW ---
// We've expanded the config to include an optional `debug` object.
export type ServerConfig = {
  initializer: (set: any, get: any) => any;
  debug?: {
    simulatedLatencyMs?: number;
  };
};

// This is the factory. It sets up and returns a ready-to-use server instance.
export function createServer(config: ServerConfig) {
  const app = express();
  app.use(cors());
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  // --- MODIFIED ---
  // We now pass the latency setting from the config into the controller's constructor.
  const roomController = new StoreController(config.initializer, {
    simulatedLatencyMs: config.debug?.simulatedLatencyMs || 0,
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // This logic now needs to be async to handle the potential delay
    const initializeClient = async () => {
      const joinPatches = await roomController.dispatch(
        "addCharacter",
        [socket.id],
        socket.id
      );
      socket.emit("initial_state", roomController.getState());
      socket.broadcast.emit("patch", joinPatches);
    };
    initializeClient();

    // --- MODIFIED ---
    // The command dispatcher is now ASYNCHRONOUS to handle the delay.
    socket.on(
      "dispatch_command",
      async (actionName: string, ...args: unknown[]) => {
        const patches = await roomController.dispatch(
          actionName,
          args,
          socket.id
        );
        if (patches.length > 0) {
          console.log(
            `Broadcasting ${patches.length} patches for action: ${actionName}`
          );
          io.emit("patch", patches);
        }
      }
    );

    socket.on("disconnect", async () => {
      console.log(`Client disconnected: ${socket.id}`);
      const leavePatches = await roomController.dispatch(
        "removeCharacter",
        [socket.id],
        socket.id
      );
      if (leavePatches.length > 0) {
        socket.broadcast.emit("patch", leavePatches);
      }
    });
  });

  return { server };
}
