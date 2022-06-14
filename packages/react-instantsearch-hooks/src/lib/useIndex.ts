import index from 'instantsearch.js/es/widgets/index/index';
import { useMemo } from 'react';

import { useIndexContext } from '../lib/useIndexContext';
import { useInstantSearchServerContext } from '../lib/useInstantSearchServerContext';

import { useForceUpdate } from './useForceUpdate';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useStableValue } from './useStableValue';
import { useWidget } from './useWidget';

import type { IndexWidgetParams } from 'instantsearch.js/es/widgets/index/index';

export type UseIndexProps = IndexWidgetParams;

export function useIndex(props: UseIndexProps) {
  const serverContext = useInstantSearchServerContext();
  const parentIndex = useIndexContext();
  const stableProps = useStableValue(props);
  const indexWidget = useMemo(() => index(stableProps), [stableProps]);
  const helper = indexWidget.getHelper();
  const forceUpdate = useForceUpdate();

  useIsomorphicLayoutEffect(() => {
    forceUpdate();
  }, [helper, forceUpdate]);

  useWidget(indexWidget, parentIndex, stableProps);

  // On the server, we directly add the Index widget early to retrieve its child
  // widgets' search parameters in the render pass.
  // On SSR, we also add the Index here to synchronize the search state associated
  // to the widgets.
  if (serverContext && !parentIndex.getWidgets().includes(indexWidget)) {
    parentIndex.addWidgets([indexWidget]);
  }

  return indexWidget;
}
