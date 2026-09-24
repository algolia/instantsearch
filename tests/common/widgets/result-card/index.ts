import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';
import { createTemplatesTests } from './templates';

import type { TestOptions, TestSetup } from '../../common';
import type { ResultCardConnectorParams } from 'instantsearch.js/es/connectors/result-card/connectResultCard';
import type { ResultCardWidget } from 'instantsearch.js/es/widgets/result-card/result-card';
import type { ResultCardProps } from 'react-instantsearch';

type JSBaseWidgetParams = Parameters<ResultCardWidget>[0];
/**
 * Whether the setup also mounts a `chat` widget with the card's `agentId` on
 * the index. `true` by default so the "Continue in chat" handoff has a target;
 * set it to `false` for a test that asserts the unconfigured page.
 */
type ChatPresenceParams = { renderChat?: boolean };

export type JSResultCardWidgetParams = Omit<JSBaseWidgetParams, 'container'> &
  ResultCardConnectorParams &
  ChatPresenceParams;
export type ReactResultCardWidgetParams = ResultCardProps & ChatPresenceParams;

type ResultCardWidgetParams = {
  javascript: JSResultCardWidgetParams;
  react: ReactResultCardWidgetParams;
  vue: Record<string, never>;
};

declare module '../../common' {
  interface FlavoredWidgetParams {
    createResultCardWidgetTests: ResultCardWidgetParams;
  }
}

export type ResultCardWidgetSetup = TestSetup<{
  widgetParams: ResultCardWidgetParams;
}>;

export function createResultCardWidgetTests(
  setup: ResultCardWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
    // The setup mounts a `chat` alongside the widget, and a chat restores its
    // conversation from `sessionStorage`: without this it inherits whatever the
    // chat suites left behind in the same file.
    sessionStorage.clear();
  });

  skippableDescribe('ResultCard widget common tests', skippedTests, () => {
    createOptionsTests(setup, { act, skippedTests, flavor });
    createTemplatesTests(setup, { act, skippedTests, flavor });
  });
}
createResultCardWidgetTests.flavored = true;
