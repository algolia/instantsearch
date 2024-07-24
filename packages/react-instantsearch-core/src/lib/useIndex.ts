import index from 'instantsearch.js/es/widgets/index/index';
import { useMemo } from 'react';

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
  const helper = indexWidget.getHelper();
  const forceUpdate = useForceUpdate();

  useIsomorphicLayoutEffect(() => {
    forceUpdate();
  }, [helper, forceUpdate]);

  useWidget({
    widget: indexWidget,
    parentIndex,
    props: stableProps,
    shouldSsr: Boolean(serverContext || initialResults),
  });

  return indexWidget;
}
