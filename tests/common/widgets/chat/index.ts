import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { ChatConnectorParams } from 'instantsearch.js/es/connectors/chat/connectChat';
import type { ChatWidget } from 'instantsearch.js/es/widgets/chat/chat';

type WidgetParams = Parameters<ChatWidget>[0];
export type ChatWidgetSetup = TestSetup<{
  // Explicitly adding ChatConnectorParams back. For some reason
  // ChatConnectorParams are not inferred when Omit is used with WidgetParams.
  widgetParams: Omit<WidgetParams, 'container'> & ChatConnectorParams;
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
