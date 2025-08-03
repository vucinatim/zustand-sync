# **Complete TypeScript Configuration & Package.json Files**

## **📁 Root Monorepo**

### **package.json**
```json
{
  "name": "zustand-sync-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "tsc -b packages/client packages/server && cd apps/demo && pnpm build",
    "start": "cd apps/demo && pnpm start",
    "dev": "pnpm --filter @zustand-sync/demo dev"
  },
  "pnpm": {
    "overrides": {
      "zustand": "5.0.7"
    }
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "typescript": "~5.8.3"
  }
}
```

### **tsconfig.json**
```json
{
  "files": [],
  "references": [{ "path": "packages/client" }, { "path": "apps/demo" }]
}
```

### **tsconfig.base.json**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["ESNext", "DOM"],
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### **tsconfig.app.json**
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

### **tsconfig.server.json**
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "outDir": "dist-server",
    "noEmit": false
  },
  "include": ["src/server", "src/common"]
}
```

---

## **📁 Apps/Demo**

### **package.json**
```json
{
  "name": "@zustand-sync/demo",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -p tsconfig.server.json && vite build --outDir dist/client",
    "start": "node dist/server.js",
    "lint": "eslint .",
    "preview": "vite preview",
    "dev:server": "tsx watch server.ts"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@pixi/react": "8.0.0-beta.25",
    "@tailwindcss/vite": "^4.1.11",
    "@zustand-sync/client": "workspace:*",
    "@zustand-sync/core": "workspace:*",
    "@zustand-sync/server": "workspace:*",
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "immer": "^10.1.1",
    "pixi.js": "^8.2.6",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "socket.io": "^4.8.1",
    "socket.io-client": "^4.8.1",
    "tailwindcss": "^4.1.11",
    "zustand": "^5.0.7"
  },
  "devDependencies": {
    "@eslint/js": "^9.30.1",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^4.6.0",
    "eslint": "^9.30.1",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^16.3.0",
    "ts-node-dev": "^2.0.0",
    "tsx": "^4.20.3",
    "typescript": "~5.8.3",
    "typescript-eslint": "^8.35.1",
    "vite": "^7.0.4"
  }
}
```

### **tsconfig.json**
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "noEmit": true
  },
  "include": ["src"],
  "references": [
    { "path": "../../packages/client" },
    { "path": "../../packages/core" }
  ]
}
```

### **tsconfig.server.json**
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "noEmit": false,
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  },
  "include": ["server.ts", "src/common/**/*.ts"],
  "references": [
    { "path": "../../packages/server" },
    { "path": "../../packages/client" }
  ]
}
```

### **tsconfig.node.json**
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

---

## **📁 Packages/Client**

### **package.json**
```json
{
  "name": "@zustand-sync/client",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc"
  },
  "dependencies": {
    "immer": "^10.1.1",
    "socket.io-client": "^4.8.1",
    "@zustand-sync/core": "workspace:*"
  },
  "peerDependencies": {
    "zustand": ">=4.0.0"
  }
}
```

### **tsconfig.json**
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    "outDir": "dist",
    "rootDir": "src",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  },
  "include": ["src"]
}
```

---

## **📁 Packages/Server**

### **package.json**
```json
{
  "name": "@zustand-sync/server",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc"
  },
  "dependencies": {
    "express": "^4.19.2",
    "socket.io": "^4.8.1",
    "immer": "^10.1.1",
    "@zustand-sync/core": "workspace:*"
  },
  "peerDependencies": {
    "zustand": ">=4.0.0"
  }
}
```

### **tsconfig.json**
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    "outDir": "dist",
    "rootDir": "src",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  },
  "include": ["src"]
}
```

---

## **📁 Packages/Core**

### **package.json**
```json
{
  "name": "@zustand-sync/core",
  "version": "0.1.0",
  "main": "index.ts",
  "types": "index.ts"
}
```

### **tsconfig.json**
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist" },
  "include": ["."]
}
```

---

## **📊 Summary**

| Package | TypeScript Configs | Package.json |
|---------|-------------------|--------------|
| **Root** | 4 configs | 1 file |
| **Apps/Demo** | 3 configs | 1 file |
| **Packages/Client** | 1 config | 1 file |
| **Packages/Server** | 1 config | 1 file |
| **Packages/Core** | 1 config | 1 file |
| **Total** | **10 configs** | **5 files** |

**Total Files: 15 configuration files** 