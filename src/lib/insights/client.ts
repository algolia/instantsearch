import { SearchResults } from 'algoliasearch-helper';
import { uniq, find, createDocumentationMessageGenerator } from '../utils';
import {
  Hits,
  InsightsClient,
  InsightsClientMethod,
  InsightsClientPayload,
  InsightsClientWrapper,
  Renderer,
  Unmounter,
  WidgetFactory,
  HitWithPosition,
  Hit,
} from '../../types';

const getSelectedHits = <THits extends Hit>(
  hits: THits[],
  selectedObjectIDs: string[]
): THits[] => {
  return selectedObjectIDs.map(objectID => {
    const hit = find(hits, h => h.objectID === objectID);
    if (typeof hit === 'undefined') {
      throw new Error(
        `Could not find objectID "${objectID}" passed to \`clickedObjectIDsAfterSearch\` in the returned hits. This is necessary to infer the absolute position and the query ID.`
      );
    }
    return hit;
  });
};

const getQueryID = (selectedHits: Hits): string => {
  const queryIDs = uniq(selectedHits.map(hit => hit.__queryID));
  if (queryIDs.length > 1) {
    throw new Error(
      'Insights currently allows a single `queryID`. The `objectIDs` provided map to multiple `queryID`s.'
    );
  }
  const queryID = queryIDs[0];
  if (typeof queryID !== 'string') {
    throw new Error(
      `Could not infer \`queryID\`. Ensure InstantSearch \`clickAnalytics: true\` was added with the Configure widget.

See: https://alg.li/lNiZZ7`
    );
  }
  return queryID;
};

const getPositions = (selectedHits: HitWithPosition[]): number[] =>
  selectedHits.map(hit => hit.__position);

export const inferPayload = ({
  method,
  results,
  hits,
  objectIDs,
}: {
  method: InsightsClientMethod;
  results: SearchResults;
  hits: HitWithPosition[];
  objectIDs: string[];
}): Omit<InsightsClientPayload, 'eventName'> => {
  const { index } = results;
  const selectedHits = getSelectedHits(hits, objectIDs);
  const queryID = getQueryID(selectedHits);

  switch (method) {
    case 'clickedObjectIDsAfterSearch': {
      const positions = getPositions(selectedHits);
      return { index, queryID, objectIDs, positions };
    }

    case 'convertedObjectIDsAfterSearch':
      return { index, queryID, objectIDs };

    default:
      throw new Error(`Unsupported method passed to insights: "${method}".`);
  }
};

const wrapInsightsClient = <THit extends HitWithPosition>(
  aa: InsightsClient | null,
  results: SearchResults,
  hits: THit[]
): InsightsClientWrapper => (
  method: InsightsClientMethod,
  payload: Partial<InsightsClientPayload>
) => {
  if (!aa) {
    const withInstantSearchUsage = createDocumentationMessageGenerator({
      name: 'instantsearch',
    });
    throw new Error(
      withInstantSearchUsage(
        'The `insightsClient` option has not been provided to `instantsearch`.'
      )
    );
  }
  if (!Array.isArray(payload.objectIDs)) {
    throw new TypeError('Expected `objectIDs` to be an array.');
  }
  const inferredPayload = inferPayload({
    method,
    results,
    hits,
    objectIDs: payload.objectIDs,
  });
  aa(method, { ...inferredPayload, ...payload } as any);
};

type Connector<TRenderOptions, TWidgetParams> = (
  renderFn: Renderer<TRenderOptions, TWidgetParams>,
  unmountFn: Unmounter
) => WidgetFactory<TWidgetParams>;

export default function withInsights<TRenderOptions, TWidgetParams>(
  connector: Connector<TRenderOptions, TWidgetParams>
): Connector<TRenderOptions, TWidgetParams> {
  const wrapRenderFn = (
    renderFn: Renderer<TRenderOptions, TWidgetParams>
  ): Renderer<TRenderOptions, TWidgetParams> => (
    renderOptions,
    isFirstRender
  ) => {
    const { results, hits, instantSearchInstance } = renderOptions;
    if (results && hits && instantSearchInstance) {
      const insights = wrapInsightsClient(
        instantSearchInstance.insightsClient,
        results,
        hits as HitWithPosition[]
      );
      return renderFn({ ...renderOptions, insights }, isFirstRender);
    }
    return renderFn(renderOptions, isFirstRender);
  };

  return (
    renderFn: Renderer<TRenderOptions, TWidgetParams>,
    unmountFn: Unmounter
  ) => connector(wrapRenderFn(renderFn), unmountFn);
}
