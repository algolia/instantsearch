import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';

import type { SupportedFlavor, TestOptions, TestSetup } from '../../common';
import type { ChatConnectorParams } from 'instantsearch.js/es/connectors/chat/connectChat';
import type { ChatWidget } from 'instantsearch.js/es/widgets/chat/chat';
import type { ChatProps } from 'react-instantsearch';

type JSBaseWidgetParams = Parameters<ChatWidget>[0];
// Explicitly adding ChatConnectorParams back. For some reason
// ChatConnectorParams are not inferred when Omit is used with WidgetParams.
export type JSChatWidgetParams = Omit<JSBaseWidgetParams, 'container'> &
  ChatConnectorParams;
export type ReactChatWidgetParams = ChatProps<unknown>;

type ChatWidgetParams<T extends SupportedFlavor = 'javascript'> = {
  javascript: JSChatWidgetParams;
  react: ReactChatWidgetParams;
  vue: Record<string, never>;
}[T];

export type ChatWidgetSetup<T extends SupportedFlavor> = TestSetup<{
  widgetParams: ChatWidgetParams<T>;
}>;

declare module '../../common' {
  interface FlavoredWidgetParams {
    createChatWidgetTests: {
      javascript: JSChatWidgetParams;
      react: ReactChatWidgetParams;
      vue: Record<string, never>;
    };
  }
}

export function createChatWidgetTests<T extends SupportedFlavor>(
  setup: ChatWidgetSetup<T>,
  {
    act = fakeAct,
    skippedTests = {},
    flavor = 'javascript' as T,
  }: TestOptions<T> = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe('Chat widget common tests', skippedTests, () => {
    createOptionsTests(setup, {
      act,
      skippedTests,
      flavor,
    });
  });
}
