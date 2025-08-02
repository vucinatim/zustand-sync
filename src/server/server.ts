// src/server/server.ts (REVISED - CLEAN AND GENERIC)

import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { gameStoreInitializer } from "../common/store"; // Import the shared recipe
import { StoreController } from "./StoreController";

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// For this PoC, we create one controller for our single "room".
// In a real app, this would be a Map<string, StoreController>.
const roomController = new StoreController(gameStoreInitializer);

io.on("connection", (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Dispatch an 'addCharacter' action to add the new player to the state.
  const joinPatches = roomController.dispatch(
    "addCharacter",
    [socket.id],
    socket.id
  );

  // Send the full, up-to-date state to the newly connected client.
  socket.emit("initial_state", roomController.getState());

  // Broadcast the patches that add the new player to all other clients.
  socket.broadcast.emit("patch", joinPatches);

  // The command dispatcher is now incredibly simple and generic.
  socket.on("dispatch_command", (actionName: string, ...args: unknown[]) => {
    // The controller handles all validation, execution, and patch generation.
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
    // Dispatch a 'removeCharacter' action to remove the player.
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

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
