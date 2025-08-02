// src/server/server.ts (REVISED)

import { createServer } from "@zustand-sync/server";
import { gameStoreInitializer } from "./src/common/store";

// 3. Configure the server, now with a debug option!
const { server } = createServer({
  initializer: gameStoreInitializer,
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
    `Server is listening on port ${PORT} with a 500ms simulated delay.`
  );
});
