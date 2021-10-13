import index from 'instantsearch.js/es/widgets/index/index';
import { useEffect, useMemo } from 'react';

import { useForceUpdate } from './useForceUpdate';
import { useIndexContext } from './useIndexContext';
import { useStableValue } from './useStableValue';

import type { IndexWidgetParams } from 'instantsearch.js/es/widgets/index/index';

export type UseIndexProps = IndexWidgetParams;

export function useIndex(props: UseIndexProps) {
  const parentIndex = useIndexContext();
  const stableProps = useStableValue(props);
  const indexWidget = useMemo(() => index(stableProps), [stableProps]);
  const helper = indexWidget.getHelper();
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    forceUpdate();
  }, [helper, forceUpdate]);

  useEffect(() => {
    parentIndex.addWidgets([indexWidget]);

    return () => {
      parentIndex.removeWidgets([indexWidget]);
    };
  }, [parentIndex, indexWidget]);

  return indexWidget;
}
