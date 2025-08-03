# Zustand-Sync Project Structure

## Overview
This is a monorepo containing a real-time multiplayer game synchronization framework built with Zustand, Socket.IO, and TypeScript. The project uses a client-server architecture with authoritative server simulation and client-side prediction.

## Root Structure
```
zustand-sync/
├── apps/                    # Application implementations
│   └── demo/               # Demo multiplayer game
├── packages/               # Core framework packages
│   ├── client/            # Client-side sync middleware
│   ├── core/              # Shared types and utilities
│   └── server/            # Server-side sync framework
├── eslint.config.js       # ESLint configuration
├── package.json           # Root package.json (monorepo)
├── pnpm-lock.yaml        # pnpm lock file
├── pnpm-workspace.yaml   # pnpm workspace configuration
├── README.md             # Project documentation
└── tsconfig files        # TypeScript configurations
```

## Apps Directory

### `apps/demo/` - Demo Multiplayer Game
A complete multiplayer platformer game demonstrating the zustand-sync framework.

#### Structure:
```
apps/demo/
├── index.html             # Main HTML entry point
├── package.json           # Demo app dependencies
├── server.ts             # Demo server implementation
├── tsconfig files        # TypeScript configurations
├── vite.config.ts        # Vite build configuration
├── public/               # Static assets
│   └── vite.svg         # Vite logo
└── src/                  # Source code
    ├── main.tsx         # React app entry point
    ├── App.tsx          # Main React component
    ├── style.css        # Global styles
    ├── vite-env.d.ts   # Vite type definitions
    ├── assets/          # Static assets
    │   └── react.svg   # React logo
    ├── common/          # Shared game logic
    │   ├── initializer.ts    # Game state and actions
    │   ├── store.ts          # Zustand store creation
    │   ├── types.ts          # TypeScript type definitions
    │   ├── physics-constants.ts  # Physics configuration
    │   └── world-constants.ts     # World/level configuration
    ├── components/      # React components
    │   ├── Character.tsx      # Player character component
    │   ├── Enemy.tsx          # Enemy entity component
    │   ├── GameController.tsx # Game input and logic controller
    │   ├── OverlayUI.tsx      # User interface overlay
    │   └── World.tsx          # Game world/level component
    ├── framework/       # Framework-specific code
    └── hooks/           # Custom React hooks
        └── useCamera.ts # Camera management hook
```

#### Key Files:

**`apps/demo/server.ts`**
- Demo server implementation
- Uses the zustand-sync server framework
- Runs authoritative game simulation at 30 FPS
- Handles client connections and state synchronization

**`apps/demo/src/common/initializer.ts`**
- Defines game state structure (characters, enemies, platforms)
- Implements all game actions (tick, setInputState, etc.)
- Contains isomorphic physics logic (runs on both client and server)
- Handles input-based authoritative movement system

**`apps/demo/src/common/store.ts`**
- Creates the Zustand store with sync middleware
- Configures client-side store with server connection
- Excludes 'tick' action from networking (local-only prediction)

**`apps/demo/src/components/GameController.tsx`**
- Handles keyboard input and sends to server
- Manages local input state tracking
- Calls local tick for client-side prediction
- Implements input-based movement system

## Packages Directory

### `packages/client/` - Client-Side Sync Framework
TypeScript package providing client-side synchronization middleware for Zustand.

#### Structure:
```
packages/client/
├── package.json          # Package dependencies
├── tsconfig.json         # TypeScript configuration
├── tsconfig.tsbuildinfo  # TypeScript build cache
└── src/
    └── index.ts         # Main client sync middleware
```

**`packages/client/src/index.ts`**
- Implements `sync()` middleware for Zustand stores
- Handles WebSocket connections to server
- Provides action wrapping for network synchronization
- Supports `excludeActions` for local-only actions
- Manages state patching and synchronization

### `packages/core/` - Shared Core Types
Contains shared TypeScript types and utilities used by both client and server.

#### Structure:
```
packages/core/
├── index.ts             # Exports shared types
├── package.json         # Package dependencies
└── tsconfig.json       # TypeScript configuration
```

**`packages/core/index.ts`**
- Defines `LocalState` interface
- Defines `SyncedStoreApi` interface
- Exports shared types for client/server communication

### `packages/server/` - Server-Side Sync Framework
TypeScript package providing server-side synchronization framework.

#### Structure:
```
packages/server/
├── package.json          # Package dependencies
├── tsconfig.json         # TypeScript configuration
├── tsconfig.tsbuildinfo  # TypeScript build cache
└── src/
    ├── index.ts         # Main server framework exports
    ├── factory.ts       # Server factory functions
    ├── RoomManager.ts   # Room management and client handling
    └── StoreController.ts # Store state management
```

**`packages/server/src/index.ts`**
- Exports server framework functions
- Provides `createServer()` factory function

**`packages/server/src/factory.ts`**
- Implements server creation logic
- Handles Socket.IO server setup
- Manages room-based client connections

**`packages/server/src/RoomManager.ts`**
- Manages game rooms and client connections
- Handles client join/leave events
- Broadcasts state updates to room members

**`packages/server/src/StoreController.ts`**
- Manages authoritative game state
- Implements server tick loop
- Handles state patching and broadcasting
- Provides action dispatching for server logic

## Configuration Files

### Root Configuration
- **`package.json`**: Monorepo configuration with workspace packages
- **`pnpm-workspace.yaml`**: pnpm workspace configuration
- **`eslint.config.js`**: ESLint rules for the entire project
- **`tsconfig.json`**: Base TypeScript configuration
- **`tsconfig.base.json`**: Shared TypeScript settings
- **`tsconfig.app.json`**: App-specific TypeScript settings
- **`tsconfig.server.json`**: Server-specific TypeScript settings

### Package-Specific Configuration
Each package has its own:
- **`package.json`**: Dependencies and scripts
- **`tsconfig.json`**: TypeScript configuration
- **`tsconfig.tsbuildinfo`**: TypeScript build cache (generated)

## Key Architectural Features

### 1. Input-Based Authoritative Model
- Clients send input state (left, right, jump) instead of position/velocity
- Server runs authoritative physics simulation
- Client-side prediction for responsive gameplay
- `tick` action excluded from networking (local-only)

### 2. Isomorphic Game Logic
- Same physics code runs on both client and server
- Client predicts movement, server validates and corrects
- Shared constants and types across client/server

### 3. Real-Time Synchronization
- Socket.IO for WebSocket communication
- Immer for immutable state updates with patches
- Optimized state patching to minimize network traffic

### 4. Modular Architecture
- Separate packages for client, server, and shared code
- Clean separation of concerns
- Reusable framework components

## Development Workflow

1. **Framework Development**: Work in `packages/` directory
2. **Demo Development**: Work in `apps/demo/` directory
3. **Build**: `pnpm build` compiles all packages
4. **Development**: `pnpm dev` runs demo app with hot reload
5. **Testing**: Demo app serves as integration test for framework

## Technology Stack

- **Frontend**: React, PixiJS, Zustand
- **Backend**: Node.js, Socket.IO
- **Build Tools**: Vite, TypeScript, pnpm
- **State Management**: Zustand with custom sync middleware
- **Networking**: Socket.IO for real-time communication
- **Immutable Updates**: Immer for state patching 