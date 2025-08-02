/* eslint-disable @typescript-eslint/no-explicit-any */
// src/server/StoreController.ts (REVISED)

import { createStore, type StoreApi } from "zustand/vanilla";
import { produceWithPatches, enablePatches, type Patch } from "immer";

enablePatches();

// --- NEW ---
type ControllerOptions = {
  simulatedLatencyMs: number;
};

export class StoreController<TState extends { actions: Record<string, any> }> {
  private store: StoreApi<TState>;
  private lastPatches: Patch[] = [];
  // --- NEW ---
  private options: ControllerOptions;

  constructor(
    initializer: (set: any, get: any) => TState,
    // --- MODIFIED ---
    // The constructor now accepts options
    options?: Partial<ControllerOptions>
  ) {
    this.store = createStore(initializer);
    this.options = { simulatedLatencyMs: 0, ...options }; // Set defaults

    this.store.subscribe((newState, prevState) => {
      const [, patches] = produceWithPatches(prevState, () => newState);
      this.lastPatches = patches;
    });
  }

  public getState() {
    return this.store.getState();
  }

  // --- MODIFIED ---
  // The dispatch method is now ASYNCHRONOUS.
  public async dispatch(
    actionName: string,
    args: unknown[],
    senderId: string
  ): Promise<Patch[]> {
    // --- NEW ---
    // Conditionally apply the delay if it's configured.
    if (this.options.simulatedLatencyMs > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.options.simulatedLatencyMs)
      );
    }

    this.lastPatches = [];

    const actionToRun = this.store.getState().actions[actionName];
    if (!actionToRun) {
      console.warn(`Action "${actionName}" not found on server store.`);
      return [];
    }

    actionToRun(...args, senderId);

    return this.lastPatches;
  }
}
