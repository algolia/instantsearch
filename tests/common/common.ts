import type { InstantSearchOptions } from 'instantsearch.js';

type MaybePromise<TResolution> = Promise<TResolution> | TResolution;

type TestSetupOptions = {
  instantSearchOptions: InstantSearchOptions;
};

export type TestSetup<TOptions = Record<string, unknown>> = (
  options: TestSetupOptions & TOptions
) => MaybePromise<void>;

export interface Act {
  (callback: () => Promise<void>): Promise<undefined>;
  (callback: () => void): void;
}
export const fakeAct = ((cb) => cb()) as Act;
