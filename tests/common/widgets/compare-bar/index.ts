import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';
import { createTemplatesTests } from './templates';

import type { TestOptions, TestSetup } from '../../common';
import type { CompareItem } from 'instantsearch.js/es/connectors/compare/connectCompare';
import type { CompareBarWidgetParams as JSBaseWidgetParams } from 'instantsearch.js/es/widgets/compare-bar/compare-bar';
import type { CompareBarProps } from 'react-instantsearch';

/**
 * Setup-only params, not forwarded to the widget:
 * - `products`: records for which the setup renders a sibling toggle button
 *   (`data-testid="CompareToggle-<objectID>"`, `aria-pressed` reflects the
 *   selection) that calls `toggleItem` on the shared selection, the way a
 *   per-hit "Compare" button would.
 * - `renderChat`: whether a `chat` is mounted on the index (`true` by default)
 *   so the hand-off has a target.
 */
type SetupParams = { products?: CompareItem[]; renderChat?: boolean };

export type JSCompareBarWidgetParams = Omit<JSBaseWidgetParams, 'container'> &
  SetupParams;
export type ReactCompareBarWidgetParams = CompareBarProps & SetupParams;
// `AisCompareBar` is plain JavaScript (no published prop types): its props
// mirror the React ones, with `classNames` keyed by the `ais-CompareBar-*`
// classes, and `slots` holds render functions for its scoped slots.
export type VueCompareBarWidgetParams = Record<string, unknown> &
  SetupParams & {
    slots?: Record<string, (props: Record<string, unknown>) => unknown>;
  };

type CompareBarWidgetParams = {
  javascript: JSCompareBarWidgetParams;
  react: ReactCompareBarWidgetParams;
  vue: VueCompareBarWidgetParams;
};

declare module '../../common' {
  interface FlavoredWidgetParams {
    createCompareBarWidgetTests: CompareBarWidgetParams;
  }
}

export type CompareBarWidgetSetup = TestSetup<{
  widgetParams: CompareBarWidgetParams;
}>;

export function createCompareBarWidgetTests(
  setup: CompareBarWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
    // The setup mounts a `chat` alongside the widget, and a chat restores its
    // conversation from `sessionStorage`: without this it inherits whatever the
    // chat suites left behind in the same file.
    sessionStorage.clear();
  });

  skippableDescribe('CompareBar widget common tests', skippedTests, () => {
    createOptionsTests(setup, { act, skippedTests, flavor });
    createTemplatesTests(setup, { act, skippedTests, flavor });
  });
}
createCompareBarWidgetTests.flavored = true;
