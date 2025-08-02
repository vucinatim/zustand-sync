/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStore, type StoreApi } from "zustand/vanilla";
import { produceWithPatches, enablePatches, type Patch } from "immer";

enablePatches();

export type ControllerOptions = {
  simulatedLatencyMs: number;
};

export class StoreController<TState extends { actions: Record<string, any> }> {
  private store: StoreApi<TState>;
  private lastPatches: Patch[] = [];
  private options: ControllerOptions;
  private connectedClients: Set<string> = new Set(); // NEW

  constructor(
    initializer: (set: any, get: any, store: StoreApi<TState>) => TState,
    options?: Partial<ControllerOptions>
  ) {
    this.store = createStore(initializer);
    this.options = { simulatedLatencyMs: 0, ...options };

    this.store.subscribe((newState, prevState) => {
      // By using a recipe that applies the new state's properties to a draft
      // of the old state, we allow immer to diff the changes correctly
      // and generate minimal patches instead of a full replacement.
      const [, patches] = produceWithPatches(prevState, (draft) => {
        Object.assign(draft, newState);
      });
      this.lastPatches = patches;
    });
  }

  // --- NEW METHODS ---
  public addClient(clientId: string): void {
    this.connectedClients.add(clientId);
  }

  public removeClient(clientId: string): void {
    this.connectedClients.delete(clientId);
  }

  public getClientCount(): number {
    return this.connectedClients.size;
  }
  // --- END NEW METHODS ---

  public getState() {
    return this.store.getState();
  }

  // NEW: Synchronous dispatch for internal server use (e.g., on-disconnect)
  public dispatchSync(
    actionName: string,
    args: unknown[],
    senderId: string
  ): Patch[] {
    this.lastPatches = [];
    const actionToRun = this.store.getState().actions[actionName];
    if (!actionToRun) {
      console.warn(`Action "${actionName}" not found on server store.`);
      return [];
    }
    actionToRun(...args, senderId);
    return this.lastPatches;
  }

  // MODIFIED: This is the existing async dispatch for client commands
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
    // We can just call the synchronous version after the delay
    return this.dispatchSync(actionName, args, senderId);
  }
}
