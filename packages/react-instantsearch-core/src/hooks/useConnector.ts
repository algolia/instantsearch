import { useMemo, useRef, useState } from 'react';

import { dequal } from '../lib/dequal';
import { getIndexSearchResults } from '../lib/getIndexSearchResults';
import { useIndexContext } from '../lib/useIndexContext';
import { useInstantSearchContext } from '../lib/useInstantSearchContext';
import { useInstantSearchServerContext } from '../lib/useInstantSearchServerContext';
import { useStableValue } from '../lib/useStableValue';
import { useWidget } from '../lib/useWidget';

import type {
  Connector,
  UiState,
  Widget,
  WidgetDescription,
} from 'instantsearch.js';

export type AdditionalWidgetProperties = Partial<Widget<WidgetDescription>>;

export function useConnector<
  TProps extends Record<string, unknown>,
  TDescription extends WidgetDescription
>(
  connector: Connector<TDescription, TProps>,
  props: TProps = {} as TProps,
  additionalWidgetProperties: AdditionalWidgetProperties = {}
): TDescription['renderState'] {
  const serverContext = useInstantSearchServerContext();
  const search = useInstantSearchContext();
  const parentIndex = useIndexContext();
  const stableProps = useStableValue(props);
  const stableAdditionalWidgetProperties = useStableValue(
    additionalWidgetProperties
  );
  const shouldSetStateRef = useRef(true);
  const previousRenderStateRef = useRef<TDescription['renderState'] | null>(
    null
  );
  const previousStatusRef = useRef(search.status);

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

          // We only update the state when a widget render state param changes,
          // except for functions. We ignore function reference changes to avoid
          // infinite loops. It's safe to omit them because they get updated
          // every time another render param changes.
          if (
            !dequal(
              renderState,
              previousRenderStateRef.current,
              (a, b) =>
                a?.constructor === Function && b?.constructor === Function
            ) ||
            instantSearchInstance.status !== previousStatusRef.current
          ) {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            setState(renderState);
            previousRenderStateRef.current = renderState;
            previousStatusRef.current = instantSearchInstance.status;
          }
        }
      },
      () => {
        // We'll ignore the next state update until we know for sure that
        // InstantSearch.js re-inits the component.
        shouldSetStateRef.current = false;
      }
    );

    return {
      ...createWidget(stableProps),
      ...stableAdditionalWidgetProperties,
    };
  }, [connector, stableProps, stableAdditionalWidgetProperties]);

  const [state, setState] = useState<TDescription['renderState']>(() => {
    if (widget.getWidgetRenderState) {
      // The helper exists because we've started InstantSearch.
      const helper = parentIndex.getHelper()!;
      const uiState = parentIndex.getWidgetUiState<UiState>({})[
        parentIndex.getIndexId()
      ];
      helper.state =
        widget.getWidgetSearchParameters?.(helper.state, { uiState }) ||
        helper.state;
      const { results, scopedResults } = getIndexSearchResults(parentIndex);

      // We get the widget render state by providing the same parameters as
      // InstantSearch provides to the widget's `render` method.
      // See https://github.com/algolia/instantsearch.js/blob/019cd18d0de6dd320284aa4890541b7fe2198c65/src/widgets/index/index.ts#L604-L617
      const { widgetParams, ...renderState } = widget.getWidgetRenderState({
        helper,
        parent: parentIndex,
        instantSearchInstance: search,
        results,
        scopedResults,
        state: helper.state,
        renderState: search.renderState,
        templatesConfig: search.templatesConfig,
        createURL: parentIndex.createURL,
        searchMetadata: {
          isSearchStalled: search.status === 'stalled',
        },
        status: search.status,
        error: search.error,
      });

      return renderState;
    }

    return {};
  });

  useWidget({
    widget,
    parentIndex,
    props: stableProps,
    shouldSsr: Boolean(serverContext),
  });

  return state;
}
