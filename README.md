# Zustand Multiplayer Proof of Concept

A minimal, working demonstration of a Zustand-based, server-authoritative multiplayer framework using Vite and Socket.IO.

## Features

- **Server-authoritative state management** using Zustand and Immer
- **Real-time synchronization** via Socket.IO
- **Drag and drop interface** using @dnd-kit
- **Patch-based updates** for efficient state synchronization
- **Type-safe** with TypeScript

## Project Structure

```
/src
├── /client
│   ├── /components
│   │   └── DraggableBox.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── framework.ts
│
├── /common
│   └── store.ts
│
└── /server
    └── server.ts
```

## Running the Project

### Prerequisites

Make sure you have all dependencies installed:
```bash
pnpm install
```

### Development

1. **Start the server** (in one terminal):
```bash
pnpm run dev:server
```

2. **Start the client** (in another terminal):
```bash
pnpm run dev
```

3. **Open multiple browser windows** to `http://localhost:5173` to test multiplayer functionality.

## How it Works

1. **Shared Store Blueprint**: The `src/common/store.ts` defines the state structure and action signatures that both client and server understand.

2. **Server Authority**: The server (`src/server/server.ts`) maintains the authoritative state and processes all state-changing actions.

3. **Client Framework**: The client (`src/client/framework.ts`) creates a Zustand store that syncs with the server via Socket.IO.

4. **Real-time Updates**: When a client dispatches an action, it's sent to the server, processed, and the resulting patches are broadcast to all connected clients.

## Testing the Multiplayer Functionality

1. Open two browser windows to the same URL
2. Drag the colored boxes in one window
3. Watch them update in real-time in the other window
4. Click "Reset Positions" to see authoritative commands in action

## Key Concepts

- **Synced State**: State that is synchronized between all clients (boxes positions)
- **Local State**: State that is purely local to each client (connection status, client ID)
- **Actions**: Commands that are dispatched to the server for authoritative processing
- **Patches**: Efficient updates that describe state changes rather than full state replacement
