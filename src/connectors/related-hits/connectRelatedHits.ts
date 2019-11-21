import algoliasearchHelper, {
  SearchParameters,
  AlgoliaSearchHelper,
  SearchResults,
} from 'algoliasearch-helper';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
  warning,
} from '../../lib/utils';
import {
  RendererOptions,
  Renderer,
  WidgetFactory,
  Unmounter,
  Hit,
  ResultHit,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'related-hits',
  connector: true,
});

type MatchingPattern = {
  value?: any;
  score?: number;
};

type MatchingPatterns = {
  [attribute: string]: MatchingPattern;
};

interface RelatedHitsConnectorParams {
  container: HTMLElement;
  hit: ResultHit;
  cssClasses?: any;
  templates?: any;
  transformItems?(items: any[]): any[];
  transformSearchParameters?(
    searchParameters: SearchParameters
  ): Partial<SearchParameters>;
  limit?: number;
  matchingPatterns?: MatchingPatterns;
}

export interface RelatedHitsRendererOptions<TRelatedHitsWidgetParams>
  extends RendererOptions<TRelatedHitsWidgetParams> {
  items: Hit[];
  isFirstPage: boolean;
  isLastPage: boolean;
  showPrevious: () => void;
  showNext: () => void;
}

export type RelatedHitsRenderer<TRelatedHitsWidgetParams> = Renderer<
  RelatedHitsRendererOptions<
    RelatedHitsConnectorParams & TRelatedHitsWidgetParams
  >
>;

export type RelatedHitsWidgetFactory<TRelatedHitsWidgetParams> = WidgetFactory<
  RelatedHitsConnectorParams & TRelatedHitsWidgetParams
>;

export type RelatedHitsConnector = <TRelatedHitsWidgetParams>(
  render: RelatedHitsRenderer<TRelatedHitsWidgetParams>,
  unmount?: Unmounter
) => RelatedHitsWidgetFactory<TRelatedHitsWidgetParams>;

const attributesToIgnore = ['objectID', '_snippetResult', '_highlightResult'];

function getDefaultMatchingPatterns(hit = {}) {
  return Object.keys(hit).reduce((acc, key) => {
    if (attributesToIgnore.indexOf(key) === -1) {
      acc[key] = [{}];
    }

    return acc;
  }, {});
}

function createOptionalFilter({ attribute, attributeName, attributeValue }) {
  const filter = `${attributeName}:${attributeValue}`;
  const score =
    attribute.score !== undefined ? `<score=${attribute.score}>` : '';

  return `${filter}${score}`;
}

const connectRelatedHits: RelatedHitsConnector = (
  renderFn,
  unmountFn = noop
) => {
  checkRendering(renderFn, withUsage());

  warning(
    false,
    'RelatedHits is an experimental widget that is subject to change in next minor versions.'
  );

  return widgetParams => {
    const {
      hit,
      limit = 5,
      matchingPatterns = getDefaultMatchingPatterns(hit),
      transformItems = x => x,
      transformSearchParameters = x => x,
    } = widgetParams || ({} as typeof widgetParams);

    if (!hit) {
      throw new Error(withUsage('The `hit` option is required.'));
    }

    const optionalFilters = Object.keys(matchingPatterns).reduce<
      Array<string | string[]>
    >((acc, attributeName) => {
      const attribute = matchingPatterns[attributeName];

      // If the value is not provided (which happens most of the time),
      // we infer the value from the `hit` option.
      const attributeValue =
        attribute.value !== undefined ? attribute.value : hit[attributeName];

      if (Array.isArray(attributeValue)) {
        acc.push(
          attributeValue.map(filterValue => {
            return createOptionalFilter({
              attribute,
              attributeName,
              attributeValue: filterValue,
            });
          })
        );
      } else {
        acc.push(
          createOptionalFilter({ attribute, attributeName, attributeValue })
        );
      }

      return acc;
    }, []);

    const connectorState = {
      showPrevious: noop,
      showNext: noop,
    };

    const cachedShowPrevious = () => connectorState.showPrevious();
    const cachedShowNext = () => connectorState.showNext();

    return {
      init({ helper, instantSearchInstance }) {
        const currentPage = helper.state.page || 0;

        renderFn(
          {
            items: transformItems([]),
            isFirstPage: currentPage === 0,
            isLastPage: true,
            showPrevious: cachedShowPrevious,
            showNext: cachedShowNext,
            widgetParams,
            instantSearchInstance,
          },
          true
        );
      },

      render({ results, helper, instantSearchInstance }) {
        const currentPage = helper.state.page || 0;

        connectorState.showPrevious = () => {
          helper.setPage(Math.max(0, currentPage - 1)).search();
        };
        connectorState.showNext = () => {
          helper
            .setPage(Math.min(currentPage + 1, results.nbPages - 1))
            .search();
        };

        renderFn(
          {
            items: transformItems(results.hits),
            isFirstPage: currentPage === 0,
            isLastPage: results.nbPages <= results.page + 1,
            showPrevious: cachedShowPrevious,
            showNext: cachedShowNext,
            widgetParams,
            instantSearchInstance,
          },
          false
        );
      },

      dispose() {
        unmountFn();
      },

      getWidgetSearchParameters(state) {
        const searchParameters = transformSearchParameters(
          state.setQueryParameters({
            hitsPerPage: limit,
            // @ts-ignore TODO add `sumOrFiltersScores` type in the helper
            sumOrFiltersScores: true,
            filters: `NOT objectID:${hit.objectID}`,
            optionalFilters,
          })
        );

        return new algoliasearchHelper.SearchParameters(searchParameters);
      },
    };
  };
};

export default connectRelatedHits;
