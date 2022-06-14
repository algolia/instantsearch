import { useEffect, useRef } from 'react';

import { dequal } from './dequal';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

import type { Widget } from 'instantsearch.js';
import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';

export function useWidget<TWidget extends Widget | IndexWidget, TProps>(
  widget: TWidget,
  parentIndex: IndexWidget,
  props: TProps
) {
  const prevPropsRef = useRef<TProps>(props);
  useEffect(() => {
    prevPropsRef.current = props;
  }, [props]);

  const prevWidgetRef = useRef<TWidget>(widget);
  useEffect(() => {
    prevWidgetRef.current = widget;
  }, [widget]);

  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // This effect is responsible for adding, removing, and updating the widget.
  // We need to support scenarios where the widget is remounted quickly, like in
  // Strict Mode, so that we don't lose its state, and therefore that we don't
  // break routing.
  useIsomorphicLayoutEffect(() => {
    const previousWidget = prevWidgetRef.current;
    function cleanup() {
      parentIndex.removeWidgets([previousWidget]);
    }

    // Scenario 1: the widget is added for the first time.
    if (cleanupTimerRef.current === null) {
      parentIndex.addWidgets([widget]);
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
        cleanup();
        parentIndex.addWidgets([widget]);
      }
    }

    return () => {
      // We don't remove the widget right away, but rather schedule it so that
      // we're able to cancel it in the next effect.
      cleanupTimerRef.current = setTimeout(cleanup);
    };
  }, [parentIndex, widget]);
}
