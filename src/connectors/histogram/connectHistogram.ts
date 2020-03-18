import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';
import { Renderer, RendererOptions, WidgetFactory } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'histogram',
  connector: true,
});

export type HistogramConnectorParams = {
  attribute: string;
};

export type HistogramItem = {
  /**
   * Value this bucket starts at
   **/
  start: number;
  /**
   * Value this bucket ends at.
   **/
  end: number;
  /**
   * Number of results matched after refinement is applied.
   **/
  count: number;
};

export interface HistogramRendererOptions<THistogramWidgetParams>
  extends RendererOptions<THistogramWidgetParams> {
  items: HistogramItem[];
}

export type HistogramRenderer<THistogramWidgetParams> = Renderer<
  HistogramRendererOptions<HistogramConnectorParams & THistogramWidgetParams>
>;

export type HistogramWidgetFactory<THistogramWidgetParams> = WidgetFactory<
  HistogramConnectorParams & THistogramWidgetParams
>;

export type HistogramConnector = <THistogramWidgetParams>(
  renderFn: HistogramRenderer<THistogramWidgetParams>,
  unmountFn?: () => void
) => HistogramWidgetFactory<THistogramWidgetParams>;

const connectHistogram: HistogramConnector = (renderFn, unmountFn = noop) => {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const { attribute } = widgetParams;

    return {
      $$type: 'ais.histogram',

      init({ instantSearchInstance }) {
        renderFn(
          {
            instantSearchInstance,
            widgetParams,
            items: [],
          },
          true
        );
      },

      render({ instantSearchInstance, results }) {
        const items = (
          results._rawResults[0]?.facetDistribution?.[attribute] ?? []
        )
          // TODO: width -> count
          .map(({ start, end, width }) => ({ start, end, count: width }));

        console.log(items);
        renderFn(
          {
            instantSearchInstance,
            widgetParams,
            items,
          },
          false
        );
      },

      dispose({ state }) {
        const existingFacetDistribution = new Set(state.facetDistribution);
        existingFacetDistribution.delete(attribute);

        state.setQueryParameter('facetDistribution', [
          ...existingFacetDistribution,
        ]);

        unmountFn();
      },

      getWidgetState(uiState, { searchParameters }) {
        const histogram = searchParameters.facetDistribution;

        if (!histogram) {
          return uiState;
        }

        return {
          ...uiState,
          histogram,
        };
      },

      getWidgetSearchParameters(searchParameters) {
        // TODO: is Set good enough to use, or do we use a fallback?
        const current = new Set(...(searchParameters.facetDistribution || []));

        current.add(attribute);

        const nextParams = searchParameters.setQueryParameter(
          'facetDistribution',
          [...current]
        );

        return nextParams;
      },
    };
  };
};

function getFallbackFacetDistribution({ buckets, min, max }) {
  return Array.from({ length: buckets }, (_, i) => ({
    start: (max / buckets) * i + min,
    end: (max / buckets) * (i + 1) + min,
    count: Math.round(Math.random() * 100),
  }));
}

export default connectHistogram;
