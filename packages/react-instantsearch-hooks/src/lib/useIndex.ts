import { walkIndex } from 'instantsearch.js/es/lib/utils';
import index from 'instantsearch.js/es/widgets/index/index';
import { useMemo } from 'react';

import { useIndexContext } from '../lib/useIndexContext';

import { useForceUpdate } from './useForceUpdate';
import { useInstantSearchContext } from './useInstantSearchContext';
import { useInstantSearchServerContext } from './useInstantSearchServerContext';
import { useInstantSearchSSRContext } from './useInstantSearchSSRContext';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useStableValue } from './useStableValue';
import { useWidget } from './useWidget';

import type {
  IndexWidgetParams,
  IndexWidget,
} from 'instantsearch.js/es/widgets/index/index';

type UseIndexOwnProps = {
  /**
   * Logically mount this index to a different parent.
   * If `null`, the index is mounted to the main index.
   */
  parentIndexId?: string | null;
};

export type UseIndexProps = IndexWidgetParams & UseIndexOwnProps;

export function useIndex(props: UseIndexProps) {
  const serverContext = useInstantSearchServerContext();
  const ssrContext = useInstantSearchSSRContext();
  const initialResults = ssrContext?.initialResults;
  const parentIndex = useParentIndex(props);
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

function useParentIndex({ parentIndexId }: UseIndexOwnProps) {
  const physicalParentIndex = useIndexContext();
  const search = useInstantSearchContext();

  if (parentIndexId === null) {
    return search.mainIndex;
  }

  if (parentIndexId) {
    let foundIndex: IndexWidget | null = null;
    walkIndex(search.mainIndex, (currentIndex) => {
      if (currentIndex.getIndexId() === parentIndexId) {
        foundIndex = currentIndex;
      }
    });

    if (!foundIndex) {
      throw new Error(`Couldn't find index ${parentIndexId}`);
    }

    return foundIndex;
  }

  return physicalParentIndex;
}
