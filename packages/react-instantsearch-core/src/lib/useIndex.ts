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
  const helperRef = useRef<any>(null);
  const forceUpdate = useForceUpdate();

  useIsomorphicLayoutEffect(() => {
    const currentHelper = indexWidget.getHelper();
    if (helperRef.current === null || currentHelper !== helperRef.current) {
      helperRef.current = currentHelper;
      if (helperRef.current !== null) {
        forceUpdate();
      }
    }
  }, [indexWidget, forceUpdate]);

  useWidget({
    widget: indexWidget,
    parentIndex,
    props: stableProps,
    shouldSsr: Boolean(serverContext || initialResults),
    skipSuspense: true,
  });

  return useMemo(
    () => ({
      ...indexWidget,
      getHelper: () => {
        const currentHelper = indexWidget.getHelper();

        if (currentHelper !== null) {
          helperRef.current = currentHelper;
          return currentHelper;
        }

        if (helperRef.current !== null) {
          return helperRef.current;
        }

        return null;
      },
    }),
    [indexWidget]
  );
}
