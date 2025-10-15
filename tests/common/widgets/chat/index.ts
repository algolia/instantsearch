import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';

import type {
  SupportedFlavor,
  TestOptionsWithFlavor,
  TestSetup,
} from '../../common';
import type { ChatConnectorParams } from 'instantsearch.js/es/connectors/chat/connectChat';
import type { ChatWidget } from 'instantsearch.js/es/widgets/chat/chat';
import type { ChatProps } from 'react-instantsearch';

type JSBaseWidgetParams = Parameters<ChatWidget>[0];
// Explicitly adding ChatConnectorParams back. For some reason
// ChatConnectorParams are not inferred when Omit is used with WidgetParams.
export type JSChatWidgetParams = Omit<JSBaseWidgetParams, 'container'> &
  ChatConnectorParams;
export type ReactChatWidgetParams = ChatProps<unknown>;

export type ChatWidgetParamsByFlavor<T extends SupportedFlavor> =
  T extends 'javascript' ? JSChatWidgetParams : ReactChatWidgetParams;

export type ChatWidgetSetup<T extends SupportedFlavor> = TestSetup<{
  widgetParams: ChatWidgetParamsByFlavor<T>;
}>;

export function createChatWidgetTests<T extends SupportedFlavor>(
  setup: ChatWidgetSetup<T>,
  {
    act = fakeAct,
    skippedTests = {},
    flavor = 'javascript' as T,
  }: TestOptionsWithFlavor<T> = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe('Chat widget common tests', skippedTests, () => {
    createOptionsTests<T>(setup, {
      act,
      skippedTests,
      flavor,
    });
  });
}
