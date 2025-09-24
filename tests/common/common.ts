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
  skippedTests: SkippedTests = {},
  fn: () => void
) {
  return (skippedTests[name] ? describe.skip : describe)(name, fn);
}

export function skippableTest(
  name: string,
  skippedTests: SkippedTests = {},
  fn: () => void
) {
  return (skippedTests[name] ? test.skip : test)(name, fn);
}

export type TestOptions = {
  act?: Act;
  skippedTests?: SkippedTests;
};

export type SetupOptions<TSetup extends TestSetup<any, any>> =
  Parameters<TSetup>[0];

export type AnyTestSuite = (
  setup: TestSetup<Record<string, unknown>, any>,
  options: TestOptions
) => any;

export type TestSetupsMap<TTestSuites extends Record<string, AnyTestSuite>> = {
  [key in keyof TTestSuites]: Parameters<TTestSuites[key]>[0];
};
export type TestOptionsMap<TTestSuites extends Record<string, AnyTestSuite>> = {
  [key in keyof TTestSuites]: Parameters<TTestSuites[key]>[1];
};
export type TestSuite<
  TTestSuites extends Record<string, AnyTestSuite>,
  TKey extends keyof TTestSuites
> = {
  [key in keyof TTestSuites]: (
    setup: TestSetupsMap<TTestSuites>[key],
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
  only,
}: {
  testSuites: TTestSuites;
  testSetups: TestSetupsMap<TTestSuites>;
  testOptions: TestOptionsMap<TTestSuites>;
  only?: Array<keyof TTestSuites>;
}) {
  test('has all the tests', () => {
    expect(Object.keys(testSetups).sort()).toEqual(
      Object.keys(testSuites).sort()
    );
  });

  (Object.keys(testSuites) as Array<keyof TTestSuites>)
    .filter((name) => !only || only.includes(name))
    .forEach(<T extends keyof TTestSuites>(key: T) => {
      const suite: TestSuite<TTestSuites, T> = testSuites[key];
      suite(testSetups[key], testOptions[key]);
    });
}
