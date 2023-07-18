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

export type TestOptions = {
  skippedTests?: SkippedTests;
};

export type AnyTestSuite = (
  setup: TestSetup<Record<string, unknown>, any>,
  act: Act,
  options: TestOptions
) => any;

export type TestSetupsMap<TTestSuites extends Record<string, AnyTestSuite>> = {
  [key in keyof TTestSuites]: Parameters<TTestSuites[key]>[0];
};
export type TestOptionsMap<TTestSuites extends Record<string, AnyTestSuite>> = {
  [key in keyof TTestSuites]: Parameters<TTestSuites[key]>[2];
};
export type TestSuite<
  TTestSuites extends Record<string, AnyTestSuite>,
  TKey extends keyof TTestSuites
> = {
  [key in keyof TTestSuites]: (
    setup: TestSetupsMap<TTestSuites>[key],
    act: Act,
    option: TestOptionsMap<TTestSuites>[key]
  ) => void;
}[TKey];

/**
 * Run all the test suites.
 */
export function runTestSuites<
  TTestSuites extends Record<string, AnyTestSuite>
>({
  testSuites,
  testSetups,
  testOptions,
  act = fakeAct,
}: {
  testSuites: TTestSuites;
  testSetups: TestSetupsMap<TTestSuites>;
  act?: Act;
  testOptions: TestOptionsMap<TTestSuites>;
}) {
  test('has all the tests', () => {
    expect(Object.keys(testSetups).sort()).toEqual(
      Object.keys(testSuites).sort()
    );
  });

  (Object.keys(testSuites) as Array<keyof TTestSuites>).forEach(
    <T extends keyof TTestSuites>(key: T) => {
      const suite: TestSuite<TTestSuites, T> = testSuites[key];
      suite(testSetups[key], act, testOptions[key]);
    }
  );
}
