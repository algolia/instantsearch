import index from 'instantsearch.js/es/widgets/index/index';
import { useMemo, useRef } from 'react';

import { useForceUpdate } from './useForceUpdate';
import { useIndexContext } from './useIndexContext';
import { useInstantSearchServerContext } from './useInstantSearchServerContext';
import { useInstantSearchSSRContext } from './useInstantSearchSSRContext';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useStableValue } from './useStableValue';
import { useWidget } from './useWidget';

import type { IndexWidgetParams } from 'instantsearch.js/es/widgets/index/index';

export type UseIndexProps = IndexWidgetParams;

export function useIndex(props: UseIndexProps) {
  const serverContext = useInstantSearchServerContext();
  const ssrContext = useInstantSearchSSRContext();
  const initialResults = ssrContext?.initialResults;
  const parentIndex = useIndexContext();
  const stableProps = useStableValue(props);
  const indexWidget = useMemo(() => index(stableProps), [stableProps]);
  const helperRef = useRef(indexWidget.getHelper());
  const forceUpdate = useForceUpdate();

  useIsomorphicLayoutEffect(() => {
    // Re-fetch the helper after any potential freeze/unfreeze
    const currentHelper = indexWidget.getHelper();
    // Update the helper reference if it changed
    if (currentHelper !== helperRef.current) {
      helperRef.current = currentHelper;
      forceUpdate();
    }
  }, [indexWidget, forceUpdate]);

  useWidget({
    widget: indexWidget,
    parentIndex,
    props: stableProps,
    shouldSsr: Boolean(serverContext || initialResults),
  });

  // Extend the indexWidget with a more reliable getHelper method
  const enhancedIndexWidget = useMemo(
    () => ({
      ...indexWidget,
      getHelper: () => {
        // Always get the most up-to-date helper when requested
        const currentHelper = indexWidget.getHelper();
        if (currentHelper !== null) {
          helperRef.current = currentHelper;
        }
        return helperRef.current;
      },
    }),
    [indexWidget]
  );

  return enhancedIndexWidget;
}
