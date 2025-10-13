import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { ChatConnectorParams } from 'instantsearch.js/es/connectors/chat/connectChat';
import type { ChatWidget } from 'instantsearch.js/es/widgets/chat/chat';
import type { ChatProps } from 'react-instantsearch';

type WidgetParams = Parameters<ChatWidget>[0];

// Explicitly adding ChatConnectorParams back. For some reason
// ChatConnectorParams are not inferred when Omit is used with WidgetParams.
export type JSChatWidgetParams = Omit<WidgetParams, 'container'> &
  ChatConnectorParams;
export type ReactChatWidgetParams = ChatProps<unknown>;

export type ChatWidgetSetup = TestSetup<{
  jsWidgetParams: JSChatWidgetParams;
  reactWidgetParams: ReactChatWidgetParams;
}>;

export function createChatWidgetTests(
  setup: ChatWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe('Chat widget common tests', skippedTests, () => {
    createOptionsTests(setup, { act, skippedTests });
  });
}
