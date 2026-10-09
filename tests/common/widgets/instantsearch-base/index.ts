import { fakeAct, skippableDescribe } from '../../common';

import { createChatTests } from './chat';
import { createInsightsTests } from './insights';

import type { TestOptions, TestSetup } from '../../common';
import type { JSChatWidgetParams, ReactChatWidgetParams } from '../chat';

type InstantSearchBaseParams<TChatParams> = {
  /**
   * The params of the `chat` widget mounted in the provider, next to a
   * `chatTrigger`.
   */
  chat: TChatParams;
  /**
   * Whether to add the Insights middleware the way the flavor documents it:
   * `provider.use(createInsightsMiddleware())` in JavaScript, and
   * `addMiddlewares` from `useInstantSearch` in React.
   */
  insights?: boolean;
};

type InstantSearchBaseWidgetParams = {
  javascript: InstantSearchBaseParams<JSChatWidgetParams>;
  react: InstantSearchBaseParams<ReactChatWidgetParams>;
  vue: Record<string, never>;
};

declare module '../../common' {
  interface FlavoredWidgetParams {
    createInstantSearchBaseWidgetTests: InstantSearchBaseWidgetParams;
  }
}

/**
 * The provider takes its credentials from `instantSearchOptions.searchClient`
 * and its index name from `instantSearchOptions.indexName`, like the
 * `InstantSearch` it replaces, but never searches with the client.
 */
export type InstantSearchBaseWidgetSetup = TestSetup<{
  widgetParams: InstantSearchBaseWidgetParams;
}>;

export function createInstantSearchBaseWidgetTests(
  setup: InstantSearchBaseWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
    sessionStorage.clear();
  });

  skippableDescribe(
    'InstantSearchBase widget common tests',
    skippedTests,
    () => {
      createChatTests(setup, { act, skippedTests, flavor });
      createInsightsTests(setup, { act, skippedTests, flavor });
    }
  );
}
createInstantSearchBaseWidgetTests.flavored = true;
