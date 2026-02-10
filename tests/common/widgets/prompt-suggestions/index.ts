import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { PromptSuggestionsConnectorParams } from 'instantsearch.js/es/connectors/prompt-suggestions/connectPromptSuggestions';
import type { Chat, UIMessage } from 'instantsearch.js/es/lib/chat';
import type { PromptSuggestionsWidget } from 'instantsearch.js/es/widgets/prompt-suggestions/prompt-suggestions';
import type { PromptSuggestionsProps } from 'react-instantsearch';

type JSBaseWidgetParams = Parameters<PromptSuggestionsWidget>[0];
export type JSPromptSuggestionsWidgetParams = Omit<
  JSBaseWidgetParams,
  'container'
> &
  PromptSuggestionsConnectorParams &
  PromptSuggestionsTestParams;
export type ReactPromptSuggestionsWidgetParams = PromptSuggestionsProps &
  PromptSuggestionsTestParams;

type PromptSuggestionsTestParams = {
  /**
   * Chat instance used by tests to wire a Chat widget.
   */
  chat?: Chat<UIMessage>;
};

type PromptSuggestionsWidgetParams = {
  javascript: JSPromptSuggestionsWidgetParams;
  react: ReactPromptSuggestionsWidgetParams;
  vue: Record<string, never>;
};

declare module '../../common' {
  interface FlavoredWidgetParams {
    createPromptSuggestionsWidgetTests: PromptSuggestionsWidgetParams;
  }
}

export type PromptSuggestionsWidgetSetup = TestSetup<{
  widgetParams: PromptSuggestionsWidgetParams;
}>;

export function createPromptSuggestionsWidgetTests(
  setup: PromptSuggestionsWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe(
    'PromptSuggestions widget common tests',
    skippedTests,
    () => {
      createOptionsTests(setup, { act, skippedTests, flavor });
    }
  );
}
createPromptSuggestionsWidgetTests.flavored = true;
