import { fakeAct } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { ChatConnectorParams } from 'instantsearch.js/src/connectors/chat/connectChat';

export type ChatConnectorSetup = TestSetup<{
  widgetParams: ChatConnectorParams;
}>;

export function createChatConnectorTests(
  setup: ChatConnectorSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeAll(() => {
    document.body.innerHTML = '';
  });

  describe('Chat connector common tests', () => {
    createOptionsTests(setup, { act, skippedTests });
  });
}
