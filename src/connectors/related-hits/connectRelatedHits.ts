import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
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
  [attribute: string]: Array<MatchingPattern>;
};

interface RelatedHitsConnectorParams {
  container: HTMLElement;
  cssClasses: any;
  templates: any;
  transformItems: any;
  hit: ResultHit;
  limit: number;
  matchingPatterns?: MatchingPatterns;
}

export interface RelatedHitsRendererOptions<TRelatedHitsWidgetParams>
  extends RendererOptions<TRelatedHitsWidgetParams> {
  items: Hit[];
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

function getDefaultMatchingPatterns(hit = {}) {
  return Object.keys(hit).reduce((acc, key) => {
    acc[key] = [{}];

    return acc;
  }, {});
}

const connectRelatedHits: RelatedHitsConnector = (
  renderFn,
  unmountFn = noop
) => {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const {
      hit,
      limit = 5,
      matchingPatterns = getDefaultMatchingPatterns(hit),
    } = widgetParams || ({} as typeof widgetParams);

    if (!hit) {
      throw new Error(withUsage('The `hit` option is required.'));
    }

    const optionalFilters = Object.keys(matchingPatterns).reduce<
      Array<string | string[]>
    >((acc, attributeName) => {
      const attributes = matchingPatterns[attributeName];

      const filters = attributes.map((attribute: MatchingPattern) => {
        const value =
          attribute.value !== undefined ? attribute.value : hit[attributeName];

        if (Array.isArray(value)) {
          return value.map(filterValue => {
            const filter = `${attributeName}:${filterValue}`;
            const score =
              attribute.score !== undefined ? `<score=${attribute.score}>` : '';

            return `${filter}${score}`;
          });
        } else {
          const filter = `${attributeName}:${value}`;
          const score =
            attribute.score !== undefined ? `<score=${attribute.score}>` : '';

          return `${filter}${score}`;
        }
      });

      acc.push(filters);

      return acc;
    }, []);

    return {
      init({ instantSearchInstance }) {
        renderFn(
          {
            items: [],
            widgetParams,
            instantSearchInstance,
          },
          true
        );
      },

      render({ results, instantSearchInstance }) {
        renderFn(
          {
            items: results.hits,
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
        const searchParameters = state.setQueryParameters({
          hitsPerPage: limit,
          // @ts-ignore TODO add this type in the helper
          sumOrFiltersScores: true,
          filters: `NOT objectID:${hit.objectID}`,
          optionalFilters,
        });

        console.log(JSON.stringify(searchParameters, null, 2));

        return searchParameters;
      },
    };
  };
};

export default connectRelatedHits;
