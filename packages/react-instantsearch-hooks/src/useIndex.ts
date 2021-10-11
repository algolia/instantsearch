import index from 'instantsearch.js/es/widgets/index/index';
import { useEffect, useMemo } from 'react';

import { useIndexContext } from './useIndexContext';

import type { IndexWidgetParams } from 'instantsearch.js/es/widgets/index/index';

export type UseIndexProps = IndexWidgetParams;

export function useIndex(props: UseIndexProps) {
  const parentIndex = useIndexContext();
  const indexWidget = useMemo(() => index(props), [props]);

  useEffect(() => {
    parentIndex.addWidgets([indexWidget]);

    return () => {
      parentIndex.removeWidgets([indexWidget]);
    };
  }, [parentIndex, indexWidget]);

  return indexWidget;
}
