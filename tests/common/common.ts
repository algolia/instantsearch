import type { InstantSearchOptions } from 'instantsearch.js';

type MaybePromise<TResolution> = Promise<TResolution> | TResolution;

type TestSetupOptions = {
  instantSearchOptions: InstantSearchOptions;
};

export type TestSetup<TOptions = Record<string, unknown>, TResult = void> = (
  options: TestSetupOptions & TOptions
) => MaybePromise<TResult>;

export interface Act {
  (callback: () => Promise<void>): Promise<undefined>;
  (callback: () => void): void;
}
export const fakeAct = ((cb) => cb()) as Act;

export type SkippedTests = Record<string, boolean>;

export function skippableDescribe(
  name: string,
  skippedTests: SkippedTests,
  fn: () => void
) {
  return (skippedTests[name] ? describe.skip : describe)(name, fn);
}
