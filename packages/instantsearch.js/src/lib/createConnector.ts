//@ts-nocheck

import { SearchParameters } from 'algoliasearch-helper';
import {
  Connector,
  DisposeOptions,
  InitOptions,
  RenderOptions,
  WidgetDescription,
} from '../types';
import { noop } from './utils';
import { RecommendParams } from './RecommendHelper';

type CreateConnectorParams<
  TWidgetDescription extends WidgetDescription,
  TConnectorParams,
  TWidgetParams
> = (widgetParams: TConnectorParams & TWidgetParams) => {
  name: string;
  dependsOn: 'search' | 'recommend';
  getWidgetParameters(
    state: SearchParameters | RecommendParams
  ): SearchParameters | RecommendParams;
  getWidgetRenderState(
    renderOptions: InitOptions | RenderOptions
  ): TWidgetDescription['renderState'];
  shouldRender?(renderOptions: RenderOptions): boolean;
};

export function createConnector<
  TWidgetDescription extends WidgetDescription,
  TConnectorParams extends object,
  TWidgetParams = {}
>(
  paramsFn: (
    widgetParams: TConnectorParams & TWidgetParams
  ) => CreateConnectorParams<
    TWidgetDescription,
    TConnectorParams,
    TWidgetParams
  >
): Connector<TWidgetDescription, TConnectorParams> {
  return function connectDynamicWidgets(renderFn, unmountFn = noop) {
    return (widgetParams) => {
      const params = paramsFn(widgetParams);

      const $$type = `ais.${params.name}`;

      const shouldRender = params.shouldRender || (() => true);

      const getWidgetRenderState = params.getWidgetRenderState;

      // @ts-ignore
      function getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          [params.name]: getWidgetRenderState(renderOptions),
        };
      }

      function init(initOptions: InitOptions) {
        const renderState = getWidgetRenderState(initOptions);

        renderFn(
          {
            ...renderState,
            instantSearchInstance: initOptions.instantSearchInstance,
            widgetParams,
          },
          true
        );
      }

      function render(renderOptions: RenderOptions) {
        if (!shouldRender(renderOptions)) {
          return;
        }

        const renderState = getWidgetRenderState(renderOptions);

        renderFn(
          {
            ...renderState,
            instantSearchInstance: renderOptions.instantSearchInstance,
            widgetParams,
          },
          false
        );

        // @ts-ignore
        renderState.sendEvent('view:internal', renderState.recommendations);
      }

      function dispose({ state }: DisposeOptions) {
        unmountFn();

        return state;
      }

      function getWidgetSearchParameters(
        state: SearchParameters | RecommendParams
      ) {
        return params.dependsOn === 'recommend'
          ? (state: SearchParameters) => state
          : params.getWidgetParameters(state);
      }

      function getWidgetRecommendParameters(state: RecommendParams) {
        return params.getWidgetParameters(state);
      }

      return {
        $$type,
        init,
        shouldRender,
        render,
        getRenderState,
        dispose,
        getWidgetSearchParameters,
        ...(params.dependsOn === 'recommend'
          ? { getWidgetRecommendParameters }
          : undefined),
      };
    };
  };
}
