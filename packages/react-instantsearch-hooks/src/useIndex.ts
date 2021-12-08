import index from 'instantsearch.js/es/widgets/index/index';
import { useEffect, useMemo, useRef } from 'react';

import { useForceUpdate } from './useForceUpdate';
import { useIndexContext } from './useIndexContext';
import { useInstantSearchServerContext } from './useInstantSearchServerContext';
import { useInstantSearchSSRContext } from './useInstantSearchSSRContext';
import { useStableValue } from './useStableValue';
import { useIsomorphicLayoutEffect } from './utils';

import type { IndexWidgetParams } from 'instantsearch.js/es/widgets/index/index';

export type UseIndexProps = IndexWidgetParams;

export function useIndex(props: UseIndexProps) {
  const serverContext = useInstantSearchServerContext();
  const ssrContext = useInstantSearchSSRContext();
  const parentIndex = useIndexContext();
  const stableProps = useStableValue(props);
  // On SSR rendering, we add the Index early in a memo to render the initial
  // results in the render pass. Since the Index is added already, we need to
  // skip the usual browser effect that adds the widget when client-side
  // rendering. We still need to run the effect lifecycle on all the other renders.
  // This ref lets us keep track whether the initial effect to add the Index
  // should be skipped.
  const shouldAddIndexRef = useRef(true);
  const indexWidget = useMemo(() => {
    const instance = index(stableProps);

    // On the server, we directly add the Index in the memo scope to retrieve
    // its child widgets' search parameters in the render pass.
    // On SSR, we also add the Index here to synchronize the search state associated
    // to the widgets.
    // In these environments, we flag that we've added the widgets early to skip
    // the initial browser effect that would otherwise add the Index a second time.
    if (serverContext || ssrContext?.initialResults) {
      parentIndex.addWidgets([instance]);
      shouldAddIndexRef.current = false;
    }

    return instance;
  }, [parentIndex, serverContext, ssrContext?.initialResults, stableProps]);
  const helper = indexWidget.getHelper();
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    forceUpdate();
  }, [helper, forceUpdate]);

  useIsomorphicLayoutEffect(() => {
    if (shouldAddIndexRef.current) {
      parentIndex.addWidgets([indexWidget]);
    }

    return () => {
      parentIndex.removeWidgets([indexWidget]);
      shouldAddIndexRef.current = true;
    };
  }, [parentIndex, indexWidget]);

  return indexWidget;
}
