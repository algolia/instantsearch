import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';
import { createTemplatesTests } from './templates';

import type { TestOptions, TestSetup } from '../../common';
import type { PromptSuggestionsConnectorParams } from 'instantsearch.js/es/connectors/prompt-suggestions/connectPromptSuggestions';
import type { PromptSuggestionsWidget } from 'instantsearch.js/es/widgets/prompt-suggestions/prompt-suggestions';
import type { PromptSuggestionsProps } from 'react-instantsearch';

type JSBaseWidgetParams = Parameters<PromptSuggestionsWidget>[0];
/**
 * Whether the setup also mounts a `chat` widget on the index. `true` by
 * default: with no chat and no `onSuggestionClick` override the widget errors,
 * since a clicked suggestion has nowhere to go. Set it to `false` for a test
 * that passes its own `onSuggestionClick`, or one that asserts the error.
 */
type ChatPresenceParams = { renderChat?: boolean };

export type JSPromptSuggestionsWidgetParams = Omit<
  JSBaseWidgetParams,
  'container'
> &
  PromptSuggestionsConnectorParams &
  ChatPresenceParams;
export type ReactPromptSuggestionsWidgetParams = PromptSuggestionsProps &
  ChatPresenceParams;

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
    // The setup mounts a `chat` alongside the widget, and a chat restores its
    // conversation from `sessionStorage`: without this it inherits whatever the
    // chat suites left behind in the same file.
    sessionStorage.clear();
  });

  skippableDescribe(
    'PromptSuggestions widget common tests',
    skippedTests,
    () => {
      createOptionsTests(setup, { act, skippedTests, flavor });
      createTemplatesTests(setup, { act, skippedTests, flavor });
    }
  );
}
createPromptSuggestionsWidgetTests.flavored = true;
