import { useMemo, useRef, useState } from 'react';

import { useIndexContext } from './useIndexContext';
import { useInstantSearchContext } from './useInstantSearchContext';
import { useInstantSearchServerContext } from './useInstantSearchServerContext';
import { useStableValue } from './useStableValue';
import { useIsomorphicLayoutEffect } from './utils';
import { createSearchResults } from './utils/createSearchResults';

import type { Connector, WidgetDescription } from 'instantsearch.js';

export function useConnector<
  TProps extends Record<string, unknown>,
  TDescription extends WidgetDescription
>(
  connector: Connector<TDescription, TProps>,
  props: TProps = {} as TProps
): TDescription['renderState'] {
  const serverContext = useInstantSearchServerContext();
  const search = useInstantSearchContext();
  const parentIndex = useIndexContext();
  const stableProps = useStableValue(props);
  const shouldSetStateRef = useRef(true);

  const widget = useMemo(() => {
    const createWidget = connector(
      (connectorState, isFirstRender) => {
        // We skip the `init` widget render because:
        // - We rely on `getWidgetRenderState` to compute the initial state before
        //   the InstantSearch.js lifecycle starts.
        // - It prevents UI flashes when updating the widget props.
        if (isFirstRender) {
          shouldSetStateRef.current = true;
          return;
        }

        // There are situations where InstantSearch.js may render widgets slightly
        // after they're removed by React, and thus try to update the React state
        // on unmounted components. React 16 and 17 consider them as memory leaks
        // and display a warning.
        // This happens in <DynamicWidgets> when `attributesToRender` contains a
        // value without an attribute previously mounted. React will unmount the
        // component controlled by that attribute, but InstantSearch.js will stay
        // unaware of this change until the render pass finishes, and therefore
        // notifies of a state change.
        // This ref lets us track this situation and ignore these state updates.
        if (shouldSetStateRef.current) {
          const { instantSearchInstance, widgetParams, ...renderState } =
            connectorState;

          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          setState(renderState);
        }
      },
      () => {
        // We'll ignore the next state update until we know for sure that
        // InstantSearch.js re-inits the component.
        shouldSetStateRef.current = false;
      }
    );

    const instance = createWidget(stableProps);

    // On the server, we add the widget early in the memo to retrieve its search
    // parameters in the render pass.
    if (serverContext) {
      parentIndex.addWidgets([instance]);
    }

    return instance;
  }, [connector, parentIndex, serverContext, stableProps]);

  const [state, setState] = useState<TDescription['renderState']>(() => {
    if (widget.getWidgetRenderState) {
      // The helper exists because we've started InstantSearch.
      const helper = parentIndex.getHelper()!;
      const results =
        parentIndex.getResults() || createSearchResults(helper.state);
      const scopedResults = parentIndex
        .getScopedResults()
        .map((scopedResult) => {
          const fallbackResults =
            scopedResult.indexId === parentIndex.getIndexId()
              ? results
              : createSearchResults(scopedResult.helper.state);

          return {
            ...scopedResult,
            // We keep `results` from being `null`.
            results: scopedResult.results || fallbackResults,
          };
        });

      // We get the widget render state by providing the same parameters as
      // InstantSearch provides to the widget's `render` method.
      // See https://github.com/algolia/instantsearch.js/blob/019cd18d0de6dd320284aa4890541b7fe2198c65/src/widgets/index/index.ts#L604-L617
      const { widgetParams, ...renderState } = widget.getWidgetRenderState({
        helper,
        parent: parentIndex,
        instantSearchInstance: search,
        results,
        scopedResults,
        state: results._state,
        renderState: search.renderState,
        templatesConfig: search.templatesConfig,
        createURL: parentIndex.createURL,
        searchMetadata: {
          isSearchStalled: search._isSearchStalled,
        },
      });

      return renderState;
    }

    return {};
  });

  // Using a layout effect adds the widget at the same time as rendering, which
  // triggers a single network request, instead of two with a regular effect.
  useIsomorphicLayoutEffect(() => {
    parentIndex.addWidgets([widget]);

    return () => {
      parentIndex.removeWidgets([widget]);
    };
  }, [widget, parentIndex]);

  return state;
}
