import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { ChatWidget } from 'instantsearch.js/es/widgets/chat/chat';

type WidgetParams = Parameters<ChatWidget>[0];
export type ChatWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
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
