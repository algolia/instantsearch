import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { ChatConnectorParams } from 'instantsearch.js/es/connectors/chat/connectChat';
import type { ChatWidget } from 'instantsearch.js/es/widgets/chat/chat';
import type { ChatProps } from 'react-instantsearch';

type JSBaseWidgetParams = Parameters<ChatWidget>[0];
// Explicitly adding ChatConnectorParams back. For some reason
// ChatConnectorParams are not inferred when Omit is used with WidgetParams.
export type JSChatWidgetParams = Omit<JSBaseWidgetParams, 'container'> &
  ChatConnectorParams;
export type ReactChatWidgetParams = ChatProps<unknown>;

export type ChatWidgetParams = JSChatWidgetParams | ReactChatWidgetParams;

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
    createOptionsTests(setup, { act, skippedTests, flavor });
  });
}
