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
      // This could unsollicitely remove/add the widget, therefore forget its state,
      // and could be a source of confusion.
      // If users face this issue, we should advise them to provide stable function
      // references.
      const arePropsEqual = dequal(props, prevPropsRef.current);

      // If props did change, then we execute the cleanup function instantly
      // and then add the widget back. This lets us add the widget without
      // waiting for the scheduled cleanup function to finish (that we canceled
      // above).
      if (!arePropsEqual) {
        parentIndex.removeWidgets([previousWidget]);
        parentIndex.addWidgets([widget]);
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
    // If we made a second request because of DynamicWidgets, we need to wait for the second result,
    // except for DynamicWidgets itself which needs to render its children after the first result.
    if (widget.$$type !== 'ais.dynamicWidgets' && search.helper?.lastResults) {
      use(waitForResultsRef.current);
    }
  }

  if (waitForResultsRef?.current?.status === 'fulfilled') {
    countRef.current += 1;
    warn(
      countRef.current > parentIndex.getWidgets().length &&
        !ignoreMultipleHooksWarning,
      `We detected you may have a component with multiple InstantSearch hooks.

With Next.js, you need to set \`skipSuspense\` to \`true\` for all but the last hook in the component, otherwise, only the first hook will be rendered on the server.

This warning can be a false positive if you are using dynamic widgets or multi-index, in which case you can ignore it by setting \`ignoreMultipleHooksWarning\` to \`true\` in \`<InstantSearchNext\`.

For more information, see https://www.algolia.com/doc/guides/building-search-ui/going-further/server-side-rendering/react/#composing-hooks`
    );
  }
}
