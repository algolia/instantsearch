import {
  checkRendering,
  warning,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';

import { AlgoliaSearchHelper, SearchParameters } from 'algoliasearch-helper';
import {
  Connector,
  TransformItems,
  CreateURL,
  InitOptions,
  RenderOptions,
  WidgetRenderState,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'hits-per-page',
  connector: true,
});

export type HitsPerPageRenderStateItem = {
  /**
   * Label to display in the option.
   */
  label: string;

  /**
   * Number of hits to display per page.
   */
  value: number;

  /**
   * Indicates if it's the current refined value.
   */
  isRefined: boolean;
};

export type HitsPerPageConnectorParamsItem = {
  /**
   * Label to display in the option.
   */
  label: string;

  /**
   * Number of hits to display per page.
   */
  value: number;

  /**
   * The default hits per page on first search.
   *
   * @default false
   */
  default?: boolean;
};

export type HitsPerPageConnectorParams = {
  /**
   * Array of objects defining the different values and labels.
   */
  items: HitsPerPageConnectorParamsItem[];

  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<HitsPerPageRenderStateItem>;
};

export type HitsPerPageRenderState = {
  /**
   * Array of objects defining the different values and labels.
   */
  items: HitsPerPageRenderStateItem[];

  /**
   * Creates the URL for a single item name in the list.
   *
   * @internal
   */
  createURL: CreateURL<HitsPerPageConnectorParamsItem['value']>;

  /**
   * Sets the number of hits per page and triggers a search.
   */
  refine: (value: number) => void;

  /**
   * Indicates whether or not the search has results.
   */
  hasNoResults: boolean;
};

export type HitsPerPageWidgetDescription = {
  $$type: 'ais.hitsPerPage';
  renderState: HitsPerPageRenderState;
  indexRenderState: {
    hitsPerPage: WidgetRenderState<
      HitsPerPageRenderState,
      HitsPerPageConnectorParams
    >;
  };
  indexUiState: {
    hitsPerPage: number;
  };
};

export type HitsPerPageConnector = Connector<
  HitsPerPageWidgetDescription,
  HitsPerPageConnectorParams
>;

const connectHitsPerPage: HitsPerPageConnector = function connectHitsPerPage(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const {
      items: userItems,
      transformItems = (items => items) as TransformItems<
        HitsPerPageRenderStateItem
      >,
    } = widgetParams || {};

    if (!Array.isArray(userItems)) {
      throw new Error(
        withUsage('The `items` option expects an array of objects.')
      );
    }

    let items = userItems;

    const defaultItems = items.filter(item => item.default === true);

    if (defaultItems.length === 0) {
      throw new Error(
        withUsage(`A default value must be specified in \`items\`.`)
      );
    }

    if (defaultItems.length > 1) {
      throw new Error(
        withUsage('More than one default value is specified in `items`.')
      );
    }

    const defaultItem = defaultItems[0];

    const normalizeItems = ({ hitsPerPage }: SearchParameters) => {
      return items.map(item => ({
        ...item,
        isRefined: Number(item.value) === Number(hitsPerPage),
      }));
    };

    type ConnectorState = {
      getRefine: (
        helper: AlgoliaSearchHelper
      ) => (value: HitsPerPageConnectorParamsItem['value']) => any;
      createURLFactory: (props: {
        state: SearchParameters;
        createURL: (InitOptions | RenderOptions)['createURL'];
      }) => HitsPerPageRenderState['createURL'];
    };

    const connectorState: ConnectorState = {
      getRefine: helper => value => {
        return !value && value !== 0
          ? helper.setQueryParameter('hitsPerPage', undefined).search()
          : helper.setQueryParameter('hitsPerPage', value).search();
      },
      createURLFactory: ({ state, createURL }) => value =>
        createURL(
          state
            .resetPage()
            .setQueryParameter(
              'hitsPerPage',
              !value && value !== 0 ? undefined : value
            )
        ),
    };

    return {
      $$type: 'ais.hitsPerPage',

      init(initOptions) {
        const { state, instantSearchInstance } = initOptions;

        const isCurrentInOptions = items.some(
          item => Number(state.hitsPerPage) === Number(item.value)
        );

        if (!isCurrentInOptions) {
          warning(
            state.hitsPerPage !== undefined,
            `
\`hitsPerPage\` is not defined.
The option \`hitsPerPage\` needs to be set using the \`configure\` widget.

Learn more: https://www.algolia.com/doc/api-reference/widgets/hits-per-page/js/
            `
          );

          warning(
            false,
            `
The \`items\` option of \`hitsPerPage\` does not contain the "hits per page" value coming from the state: ${state.hitsPerPage}.

You may want to add another entry to the \`items\` option with this value.`
          );

          items = [
            // The helper will convert the empty string to `undefined`.
            { value: ('' as unknown) as number, label: '' },
            ...items,
          ];
        }

        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance,
          },
          true
        );
      },

      render(initOptions) {
        const { instantSearchInstance } = initOptions;

        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

        return state.setQueryParameter('hitsPerPage', undefined);
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          hitsPerPage: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState({ state, results, createURL, helper }) {
        return {
          items: transformItems(normalizeItems(state)),
          refine: connectorState.getRefine(helper),
          createURL: connectorState.createURLFactory({ state, createURL }),
          hasNoResults: results ? results.nbHits === 0 : true,
          widgetParams,
        };
      },

      getWidgetUiState(uiState, { searchParameters }) {
        const hitsPerPage = searchParameters.hitsPerPage;

        if (hitsPerPage === undefined || hitsPerPage === defaultItem.value) {
          return uiState;
        }

        return {
          ...uiState,
          hitsPerPage,
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        return searchParameters.setQueryParameters({
          hitsPerPage: uiState.hitsPerPage || defaultItem.value,
        });
      },
    };
  };
};

export default connectHitsPerPage;
