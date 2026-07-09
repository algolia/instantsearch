import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';
import { createTemplatesTests } from './templates';

import type { TestOptions, TestSetup } from '../../common';
import type { ChatPageSuggestionsConnectorParams } from 'instantsearch.js/es/connectors/chat-page-suggestions/connectChatPageSuggestions';
import type { ChatPageSuggestionsWidget } from 'instantsearch.js/es/widgets/chat-page-suggestions/chat-page-suggestions';
import type { ChatPageSuggestionsProps } from 'react-instantsearch';

type JSBaseWidgetParams = Parameters<ChatPageSuggestionsWidget>[0];
export type JSChatPageSuggestionsWidgetParams = Omit<
  JSBaseWidgetParams,
  'container'
> &
  ChatPageSuggestionsConnectorParams;
export type ReactChatPageSuggestionsWidgetParams = ChatPageSuggestionsProps;

type ChatPageSuggestionsWidgetParams = {
  javascript: JSChatPageSuggestionsWidgetParams;
  react: ReactChatPageSuggestionsWidgetParams;
  vue: Record<string, never>;
};

declare module '../../common' {
  interface FlavoredWidgetParams {
    createChatPageSuggestionsWidgetTests: ChatPageSuggestionsWidgetParams;
  }
}

export type ChatPageSuggestionsWidgetSetup = TestSetup<{
  widgetParams: ChatPageSuggestionsWidgetParams;
}>;

export function createChatPageSuggestionsWidgetTests(
  setup: ChatPageSuggestionsWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe(
    'ChatPageSuggestions widget common tests',
    skippedTests,
    () => {
      createOptionsTests(setup, { act, skippedTests, flavor });
      createTemplatesTests(setup, { act, skippedTests, flavor });
    }
  );
}
createChatPageSuggestionsWidgetTests.flavored = true;
