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

export type SupportedFlavor = 'javascript' | 'react' | 'vue';

export type TestOptions<T extends SupportedFlavor = 'javascript'> = {
  act?: Act;
  skippedTests?: SkippedTests;
  flavor?: T;
};

// Registry for widgets that have flavor-specific setup types
// Widgets can extend this interface to declare their flavor-specific types
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FlavoredWidgetParams {
  // This will be extended by widgets that need flavor-specific types
}

export type SetupOptions<TSetup extends TestSetup<any, any>> =
  Parameters<TSetup>[0];

export type AnyTestSuite = (
  setup: TestSetup<Record<string, unknown>, any>,
  options: TestOptions
) => any;

// Helper to resolve setup type - checks if widget has flavor-specific setup
type ResolveSetupType<
  TFunc extends AnyTestSuite,
  TFlavor extends SupportedFlavor,
  TFunctionName extends string = string
> = TFunctionName extends keyof FlavoredWidgetParams
  ? FlavoredWidgetParams[TFunctionName] extends Record<SupportedFlavor, any>
    ? (
        setup: {
          instantSearchOptions: InstantSearchOptions;
          widgetParams: FlavoredWidgetParams[TFunctionName][TFlavor];
        },
        options?: TestOptions<TFlavor>
      ) => void
    : Parameters<TFunc>[0]
  : Parameters<TFunc>[0];

export type TestSetupsMap<
  TTestSuites extends Record<string, AnyTestSuite>,
  TFlavor extends SupportedFlavor = SupportedFlavor
> = {
  [K in keyof TTestSuites]: ResolveSetupType<
    TTestSuites[K],
    TFlavor,
    K extends string ? K : string
  >;
};
export type TestOptionsMap<TTestSuites extends Record<string, AnyTestSuite>> = {
  [key in keyof TTestSuites]: Parameters<TTestSuites[key]>[1];
};
export type TestSuite<
  TTestSuites extends Record<string, AnyTestSuite>,
  TKey extends keyof TTestSuites,
  TFlavor extends SupportedFlavor = SupportedFlavor
> = {
  [key in keyof TTestSuites]: (
    setup: TestSetupsMap<TTestSuites, TFlavor>[key],
    option: TestOptionsMap<TTestSuites>[key]
  ) => void;
}[TKey];

/**
 * Run all the test suites.
 */
export function runTestSuites<
  TFlavor extends SupportedFlavor,
  TTestSuites extends Record<string, AnyTestSuite>
>({
  flavor,
  testSuites,
  testSetups,
  testOptions,
  only,
}: {
  flavor: TFlavor;
  testSuites: TTestSuites;
  testSetups: TestSetupsMap<TTestSuites, TFlavor>;
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
      testSuites[key](testSetups[key], { ...testOptions[key], flavor });
    });
}
