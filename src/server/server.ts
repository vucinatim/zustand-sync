// src/server/server.ts (This is now the user's entrypoint)

// 1. Import the factory from the (future) framework package
import { createServer } from "./factory";
// 2. Import the application-specific game logic
import { gameStoreInitializer } from "../common/store";

// 3. Configure the server by passing the game logic to the factory
const { server } = createServer({
  initializer: gameStoreInitializer,
});

// 4. Start the server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
