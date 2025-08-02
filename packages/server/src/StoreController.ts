/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStore, type StoreApi } from "zustand/vanilla";
import { produceWithPatches, enablePatches, type Patch } from "immer";
import { EventEmitter } from "events";

enablePatches();

export type ControllerOptions = {
  simulatedLatencyMs: number;
  serverTick?: (storeController: StoreController<any>) => void;
  serverTickRate?: number;
  serverTickEnabled?: boolean; // NEW: Control server tick system
};

export class StoreController<
  TState extends { actions: Record<string, any> }
> extends EventEmitter {
  private store: StoreApi<TState>;
  private lastPatches: Patch[] = [];
  private options: ControllerOptions;
  private connectedClients: Set<string> = new Set();
  private serverTickInterval: NodeJS.Timeout | null = null;
  private userTickFunction: ((storeController: this) => void) | undefined;

  constructor(
    initializer: (set: any, get: any, store: StoreApi<TState>) => TState,
    options?: Partial<ControllerOptions>
  ) {
    super();
    this.store = createStore(initializer);
    this.options = { simulatedLatencyMs: 0, ...options };
    this.userTickFunction = this.options.serverTick;

    this.store.subscribe((newState, prevState) => {
      const [, patches] = produceWithPatches(prevState, (draft) => {
        Object.assign(draft, newState);
      });
      this.lastPatches = patches;
    });

    this.startServerTickLoop();
  }

  private startServerTickLoop(): void {
    if (!this.userTickFunction) return;

    // Always run at least one tick for initialization
    this.userTickFunction(this);

    // Only continue ticking if enabled
    if (this.options.serverTickEnabled === false) return;

    const tickRate = this.options.serverTickRate || 1000;
    this.serverTickInterval = setInterval(() => {
      this.userTickFunction?.(this);
    }, tickRate);
  }

  public cleanup(): void {
    if (this.serverTickInterval) {
      clearInterval(this.serverTickInterval);
      this.serverTickInterval = null;
    }
  }

  public addClient(clientId: string): void {
    this.connectedClients.add(clientId);
  }
  public removeClient(clientId: string): void {
    this.connectedClients.delete(clientId);
  }
  public getClientCount(): number {
    return this.connectedClients.size;
  }
  public getState() {
    return this.store.getState();
  }

  public async dispatchSync(
    actionName: string,
    args: unknown[],
    senderId: string
  ): Promise<Patch[]> {
    this.lastPatches = [];
    const actionToRun = this.store.getState().actions[actionName];
    if (!actionToRun) {
      console.warn(`Action "${actionName}" not found on server store.`);
      return [];
    }

    console.log(
      `[StoreController] Dispatching ${actionName} from ${senderId} with args:`,
      args
    );
    actionToRun(...args, senderId);

    if (this.lastPatches.length > 0) {
      console.log(
        `[StoreController] Emitting state-changed with ${this.lastPatches.length} patches`
      );
      this.emit("state-changed", this.lastPatches);
    } else {
      console.log(`[StoreController] No patches generated for ${actionName}`);
    }

    return this.lastPatches;
  }

  public async dispatch(
    actionName: string,
    args: unknown[],
    senderId: string
  ): Promise<Patch[]> {
    if (this.options.simulatedLatencyMs > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.options.simulatedLatencyMs)
      );
    }
    return this.dispatchSync(actionName, args, senderId);
  }
}
