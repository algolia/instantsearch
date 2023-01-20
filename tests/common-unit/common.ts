import type { InstantSearchOptions } from 'instantsearch.js';

type MaybePromise<TResolution> = Promise<TResolution> | TResolution;

declare interface Act {
  (callback: () => Promise<void>): Promise<undefined>;
  (callback: () => void): void;
}

type TestSetupOptions = {
  instantSearchOptions: InstantSearchOptions;
};

export type TestSetup<TOptions = Record<string, unknown>> = (
  options: TestSetupOptions & TOptions
) => MaybePromise<{
  container: HTMLElement;
  act?: Act;
}>;

export const fakeAct = ((cb) => cb()) as Act;
