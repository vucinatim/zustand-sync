import { createServer } from "@zustand-sync/server";
// --- MODIFIED IMPORT ---
// Import the pure logic, NOT the client-side store.
import { gameStoreInitializer } from "./src/common/initializer";

// 3. Configure the server with the new generic tick system!
let lastTickTime = Date.now();

const { server } = createServer({
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

// 4. Start the server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(
    `Server is listening on port ${PORT} with generic tick system enabled.`
  );
});
