import { isTwoPassWidget } from 'instantsearch.js/es/lib/utils';
import { useEffect, useRef } from 'react';

import { dequal } from './dequal';
import { use } from './use';
import { useInstantSearchContext } from './useInstantSearchContext';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useRSCContext } from './useRSCContext';
import { warn } from './warn';

import type { Widget } from 'instantsearch.js';
import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';

export function useWidget<TWidget extends Widget | IndexWidget, TProps>({
  widget,
  parentIndex,
  props,
  shouldSsr,
  skipSuspense,
}: {
  widget: TWidget;
  parentIndex: IndexWidget;
  props: TProps;
  shouldSsr: boolean;
  skipSuspense: boolean;
}) {
  const { waitForResultsRef, countRef, ignoreMultipleHooksWarning } =
    useRSCContext();

  const prevPropsRef = useRef<TProps>(props);
  useEffect(() => {
    prevPropsRef.current = props;
  }, [props]);

  const prevWidgetRef = useRef<TWidget>(widget);
  useEffect(() => {
    prevWidgetRef.current = widget;
  }, [widget]);

  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldAddWidgetEarly =
    shouldSsr && !parentIndex.getWidgets().includes(widget);

  const search = useInstantSearchContext();

  // This effect is responsible for adding, removing, and updating the widget.
  // We need to support scenarios where the widget is remounted quickly, like in
  // Strict Mode, so that we don't lose its state, and therefore that we don't
  // break routing.
  useIsomorphicLayoutEffect(() => {
    const previousWidget = prevWidgetRef.current;

    // Scenario 1: the widget is added for the first time.
    if (!cleanupTimerRef.current) {
      if (!shouldSsr) {
        parentIndex.addWidgets([widget]);
      }
    }
    // Scenario 2: the widget is rerendered or updated.
    else {
      // We cancel the original effect cleanup because it may not be necessary if
      // props haven't changed. (We manually call it if it is below.)
      clearTimeout(cleanupTimerRef.current);

      // Warning: if an unstable function prop is provided, `dequal` is not able
      // to keep its reference and therefore will consider that props did change.
      // This unsollicitely replaces the widget, which is wasteful (it causes a
      // search), even though `updateWidget` below keeps its state.
      // If users face this issue, we should advise them to provide stable function
      // references.
      const arePropsEqual = dequal(props, prevPropsRef.current);

      // If props did change, then we replace the widget instantly instead of
      // waiting for the scheduled cleanup function to finish (that we canceled
      // above). `updateWidget` hands the previous widget's `uiState` over to the
      // new one, so that a parameter change doesn't reset the state the widget
      // still owns — which would otherwise break routing.
      if (!arePropsEqual) {
        parentIndex.updateWidget(previousWidget, widget);
      }
    }

    return () => {
      // We don't remove the widget right away, but rather schedule it so that
      // we're able to cancel it in the next effect.
      cleanupTimerRef.current = setTimeout(() => {
        search._schedule(() => {
          if (search._preventWidgetCleanup) return;
          parentIndex.removeWidgets([previousWidget]);
        });
      });
    };
  }, [parentIndex, widget, shouldSsr, search, props]);

  if (
    shouldAddWidgetEarly ||
    waitForResultsRef?.current?.status === 'pending'
  ) {
    parentIndex.addWidgets([widget]);
  }

  if (waitForResultsRef?.current && !skipSuspense) {
    use(waitForResultsRef.current);
    // If we made a second request because of two-pass widgets, we need to
    // wait for the second result — except for the two-pass widgets themselves
    // which need to render their children after the first result.
    if (!isTwoPassWidget(widget) && search.helper?.lastResults) {
      use(waitForResultsRef.current);
    }
  }

  if (waitForResultsRef?.current?.status === 'fulfilled') {
    countRef.current += 1;
    warn(
      ignoreMultipleHooksWarning ||
        countRef.current <= parentIndex.getWidgets().length,
      `We detected you may have a component with multiple InstantSearch hooks.

With Next.js, you need to set \`skipSuspense\` to \`true\` for all but the last hook in the component, otherwise, only the first hook will be rendered on the server.

This warning can be a false positive if you are using dynamic widgets or multi-index, in which case you can ignore it by setting \`ignoreMultipleHooksWarning\` to \`true\` in \`<InstantSearchNext\`.

For more information, see https://www.algolia.com/doc/guides/building-search-ui/going-further/server-side-rendering/react/#composing-hooks`
    );
  }
}
