import noop from 'lodash/noop';
import { Renderer, RenderOptions, WidgetFactory } from '../../types';
import {
  checkRendering,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator({
  name: 'query-rules',
  connector: true,
});

type ParamTransformItems = (items: object[]) => any;

export type QueryRulesConnectorParams = {
  transformItems?: ParamTransformItems;
};

export interface QueryRulesRenderOptions<T> extends RenderOptions<T> {
  items: object[];
}

export type QueryRulesRenderer<T> = Renderer<
  QueryRulesRenderOptions<QueryRulesConnectorParams & T>
>;

export type QueryRulesWidgetFactory<T> = WidgetFactory<
  QueryRulesConnectorParams & T
>;

export type QueryRulesConnector = <T>(
  render: QueryRulesRenderer<T>,
  unmount?: () => void
) => QueryRulesWidgetFactory<T>;

const connectQueryRules: QueryRulesConnector = (render, unmount = noop) => {
  checkRendering(render, withUsage());

  return widgetParams => {
    const { transformItems = (items => items) as ParamTransformItems } =
      widgetParams || {};

    return {
      init({ instantSearchInstance }) {
        render(
          {
            items: [],
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ results, instantSearchInstance }) {
        const { userData = [] } = results;
        const items = transformItems(userData);

        render(
          {
            items,
            instantSearchInstance,
            widgetParams,
          },
          false
        );
      },

      dispose({ state }) {
        unmount();

        return state;
      },
    };
  };
};

export default connectQueryRules;
