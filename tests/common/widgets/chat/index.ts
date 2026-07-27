import { fakeAct, skippableDescribe } from '../../common';

import { createGuardrailsTests } from './guardrails';
import { createOptionsTests } from './options';
import { createPersistenceTests } from './persistence';
import { createStreamingTests } from './streaming';
import { createTemplatesTests } from './templates';
import { createTranslationsTests } from './translations';

import type { TestOptions, TestSetup } from '../../common';
import type { ChatConnectorParams } from 'instantsearch.js/es/connectors/chat/connectChat';
import type { ChatWidget } from 'instantsearch.js/es/widgets/chat/chat';
import type { ChatProps } from 'react-instantsearch';

type JSBaseWidgetParams = Parameters<ChatWidget>[0];
// Explicitly adding ChatConnectorParams back. For some reason
// ChatConnectorParams are not inferred when Omit is used with WidgetParams.
export type JSChatWidgetParams = Omit<JSBaseWidgetParams, 'container'> &
  ChatConnectorParams & {
    renderChat?: boolean;
    renderRefinements?: boolean;
  };
export type ReactChatWidgetParams = ChatProps<unknown> & {
  renderChat?: boolean;
  renderRefinements?: boolean;
};

type ChatWidgetParams = {
  javascript: JSChatWidgetParams;
  react: ReactChatWidgetParams;
  vue: Record<string, never>;
};

declare module '../../common' {
  interface FlavoredWidgetParams {
    createChatWidgetTests: ChatWidgetParams;
  }
}

export type ChatWidgetSetup = TestSetup<{
  widgetParams: ChatWidgetParams;
}>;

export function createChatWidgetTests(
  setup: ChatWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe('Chat widget common tests', skippedTests, () => {
    createGuardrailsTests(setup, { act, skippedTests, flavor });
    createOptionsTests(setup, { act, skippedTests, flavor });
    createPersistenceTests(setup, { act, skippedTests, flavor });
    createStreamingTests(setup, { act, skippedTests, flavor });
    createTemplatesTests(setup, { act, skippedTests, flavor });
    createTranslationsTests(setup, { act, skippedTests, flavor });
  });
}
createChatWidgetTests.flavored = true;
