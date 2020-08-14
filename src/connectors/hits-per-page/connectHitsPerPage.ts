import {
  checkRendering,
  warning,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';

import { SearchParameters } from 'algoliasearch-helper';
import { Connector, TransformItems, CreateURL } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'hits-per-page',
  connector: true,
});

export type HitsPerPageRendererOptionsItem = {
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
  transformItems?: TransformItems<HitsPerPageRendererOptionsItem>;
};

export type HitsPerPageRendererOptions = {
  /**
   * Array of objects defining the different values and labels.
   */
  items: HitsPerPageRendererOptionsItem[];

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

export type HitsPerPageConnector = Connector<
  HitsPerPageRendererOptions,
  HitsPerPageConnectorParams
>;

const connectHitsPerPage: HitsPerPageConnector = function connectHitsPerPage(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const { items: userItems, transformItems = items => items } =
      widgetParams || ({} as typeof widgetParams);
    let items = userItems;

    if (!Array.isArray(items)) {
      throw new Error(
        withUsage('The `items` option expects an array of objects.')
      );
    }

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
      setHitsPerPage: (value: HitsPerPageConnectorParamsItem['value']) => any;
      createURLFactory: (
        state: SearchParameters
      ) => HitsPerPageRendererOptions['createURL'];
    };

    const connectorState = {} as ConnectorState;

    return {
      $$type: 'ais.hitsPerPage',

      init({ helper, createURL, state, instantSearchInstance }) {
        const isCurrentInOptions = items.some(
          item => Number(state.hitsPerPage) === Number(item.value)
        );

        connectorState.setHitsPerPage = value => {
          return !value && value !== 0
            ? helper.setQueryParameter('hitsPerPage', undefined).search()
            : helper.setQueryParameter('hitsPerPage', value).search();
        };

        if (!isCurrentInOptions) {
          warning(
            state.hitsPerPage !== undefined,
            `
\`hitsPerPage\` is not defined.
The option \`hitsPerPage\` needs to be set using the \`configure\` widget.

Learn more: https://community.algolia.com/instantsearch.js/v2/widgets/configure.html
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

        connectorState.createURLFactory = helperState => value => {
          return createURL(
            helperState.setQueryParameter(
              'hitsPerPage',
              !value && value !== 0 ? undefined : value
            )
          );
        };

        renderFn(
          {
            items: transformItems(normalizeItems(state)),
            refine: connectorState.setHitsPerPage,
            createURL: connectorState.createURLFactory(helper.state),
            hasNoResults: true,
            widgetParams,
            instantSearchInstance,
          },
          true
        );
      },

      render({ state, results, instantSearchInstance }) {
        const hasNoResults = results.nbHits === 0;

        renderFn(
          {
            items: transformItems(normalizeItems(state)),
            refine: connectorState.setHitsPerPage,
            createURL: connectorState.createURLFactory(state),
            hasNoResults,
            widgetParams,
            instantSearchInstance,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

        return state.setQueryParameter('hitsPerPage', undefined);
      },

      getWidgetState(uiState, { searchParameters }) {
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
