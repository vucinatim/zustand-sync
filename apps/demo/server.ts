import { createServer } from "@zustand-sync/server";
// --- MODIFIED IMPORT ---
// Import the pure logic, NOT the client-side store.
import { gameStoreInitializer } from "./src/common/initializer.js";
import express from "express"; // Import express from the server package
import path from "path";
import { fileURLToPath } from "url";

// --- Helper for ES Modules to get __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Server Configuration ---
let lastTickTime = Date.now();

const { server, app } = createServer({
  // Destructure the 'app' instance
  initializer: gameStoreInitializer,

  // NEW: Provide a custom function for all server-side loop logic.
  serverTick: (storeController) => {
    const now = Date.now();
    const deltaTime = (now - lastTickTime) / 1000; // deltaTime in seconds
    lastTickTime = now;

    // Update server time first
    storeController.dispatchSync("updateServerTime", [now], "server");

    // The server's only job is to call the isomorphic tick function
    storeController.dispatchSync("tick", [deltaTime], "server");
  },

  // Optional: Configure the tick rate in milliseconds.
  serverTickRate: 1000 / 60, // 60 ticks per second

  // NEW: Control server tick system
  serverTickEnabled: true, // Set to false to freeze server time

  // This is how a developer enables the latency simulation.
  // In a real project, you might control this with an environment variable.
  // e.g., process.env.NODE_ENV === 'development' ? 500 : 0
  // debug: {
  //   simulatedLatencyMs: 500, // 500ms delay
  // },
});

// --- Serve Static Files from Vite Build ---
// The 'dist/client' is the output from 'vite build'
const clientBuildPath = path.join(__dirname, "..", "dist/client");
console.log("Client build path:", clientBuildPath);
console.log("__dirname:", __dirname);
app.use(express.static(clientBuildPath));

// --- API routes or other server logic would go here ---

// --- Handle all other routes by serving the index.html ---
// This is crucial for client-side routing to work
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// --- Start the Server ---
// Railway provides the PORT environment variable automatically
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
