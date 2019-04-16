import find from 'lodash/find';
import uniq from 'lodash/uniq';

import {
  Hits,
  InsightsClient,
  InsightsClientMethod,
  InsightsClientPayload,
  InsightsClientWrapper,
  Renderer,
  RenderOptions,
  Unmounter,
  WidgetFactory,
  Omit,
  SearchResults,
} from '../../types';

const getSelectedHits = (hits: Hits, selectedObjectIDs: string[]) => {
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

const getQueryID = (selectedHits: Hits) => {
  const queryIDs = uniq(selectedHits.map(hit => hit.__queryID));
  if (queryIDs.length > 1) {
    throw new Error(
      'Insights currently allows a single `queryID`. The `objectIDs` provided map to multiple `queryID`s.'
    );
  }
  const queryID = queryIDs[0];
  if (typeof queryID !== 'string') {
    throw new Error(
      'Could not infer `queryID`. Ensure InstantSearch is configured with `clickAnalytics: true`'
    );
  }
  return queryID;
};

const getPositions = (selectedHits: Hits) =>
  selectedHits.map(hit => hit.__position);

export const inferPayload = ({
  method,
  results,
  hits,
  objectIDs,
}: {
  method: InsightsClientMethod;
  results: SearchResults;
  hits: Hits;
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

const wrapInsightsClient = (
  aa: InsightsClient,
  results: SearchResults,
  hits: Hits
): InsightsClientWrapper => (
  method: InsightsClientMethod,
  payload: Partial<InsightsClientPayload>
) => {
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

type Connector<WidgetParams> = (
  renderFn: Renderer<RenderOptions<WidgetParams>>,
  unmountFn: Unmounter
) => WidgetFactory<WidgetParams>;

export default function withInsights(
  connector: Connector<unknown>
): Connector<unknown> {
  const wrapRenderFn = (
    renderFn: Renderer<RenderOptions<unknown>>
  ): Renderer<RenderOptions<unknown>> => (
    renderOptions: RenderOptions,
    isFirstRender: boolean
  ) => {
    const { results, hits, instantSearchInstance } = renderOptions;
    if (
      results &&
      hits &&
      instantSearchInstance &&
      instantSearchInstance.insightsClient /* providing the insightsClient is optional */
    ) {
      const insights = wrapInsightsClient(
        instantSearchInstance.insightsClient,
        results,
        hits
      );
      return renderFn({ ...renderOptions, insights }, isFirstRender);
    }
    return renderFn(renderOptions, isFirstRender);
  };

  return (renderFn: Renderer<RenderOptions<unknown>>, unmountFn: Unmounter) =>
    connector(wrapRenderFn(renderFn), unmountFn);
}
