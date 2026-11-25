import { fakeAct, skippableDescribe } from '../../common';

import { createGuardrailsTests } from './guardrails';
import { createOptionsTests } from './options';
import { createPersistenceTests } from './persistence';
import { createReasoningTests } from './reasoning';
import { createShortcutsTests } from './shortcuts';
import { createStreamingTests } from './streaming';
import { createTemplatesTests } from './templates';
import { createToolCancellationTests } from './tool-cancellation';
import { createToolResultTests } from './tool-results';
import { createToolRetryTests } from './tool-retry';
import { createTranslationsTests } from './translations';

import type { TestOptions, TestSetup } from '../../common';
import type { OpenChatOptions } from 'instantsearch.js/es/lib/chat';
import type { ChatWidget } from 'instantsearch.js/es/widgets/chat/chat';
import type { ChatProps } from 'react-instantsearch';

export type OpenChatFromTrigger = (options?: OpenChatOptions) => boolean;
// Setup-only params: each flavor's setup acts on them instead of passing them
// to the chat widget.
type SetupParams = {
  renderChat?: boolean;
  renderRefinements?: boolean;
  /**
   * Receives `openChat` from a `connectChatTrigger` widget the setup mounts
   * next to the chat, so a test can call it the way a custom entry point does.
   */
  captureOpenChat?: (openChat: OpenChatFromTrigger) => void;
};

type JSBaseWidgetParams = Parameters<ChatWidget>[0];
type DistributiveOmit<TValue, TKey extends PropertyKey> = TValue extends unknown
  ? Omit<TValue, TKey>
  : never;
export type JSChatWidgetParams = DistributiveOmit<
  JSBaseWidgetParams,
  'container'
> &
  SetupParams;
export type ReactChatWidgetParams = ChatProps<unknown> & SetupParams;
// `AisChat` is plain JavaScript (no published prop types); its params mirror
// the React ones, with Vue render functions (`h` from `vue`) for components.
export type VueChatWidgetParams = Record<string, unknown> & SetupParams;

type ChatWidgetParams = {
  javascript: JSChatWidgetParams;
  react: ReactChatWidgetParams;
  vue: VueChatWidgetParams;
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
    sessionStorage.clear();
  });

  skippableDescribe('Chat widget common tests', skippedTests, () => {
    createGuardrailsTests(setup, { act, skippedTests, flavor });
    createOptionsTests(setup, { act, skippedTests, flavor });
    createPersistenceTests(setup, { act, skippedTests, flavor });
    createReasoningTests(setup, { act, skippedTests, flavor });
    createShortcutsTests(setup, { act, skippedTests, flavor });
    createStreamingTests(setup, { act, skippedTests, flavor });
    createTemplatesTests(setup, { act, skippedTests, flavor });
    createToolCancellationTests(setup, { act, skippedTests, flavor });
    createToolResultTests(setup, { act, skippedTests, flavor });
    createToolRetryTests(setup, { act, skippedTests, flavor });
    createTranslationsTests(setup, { act, skippedTests, flavor });
  });
}
createChatWidgetTests.flavored = true;
