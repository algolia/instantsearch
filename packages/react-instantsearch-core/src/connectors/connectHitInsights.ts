import createConnector from '../core/createConnector';
import { getResults } from '../core/indexUtils';

type Results = { index: string };
type Hit = { objectID: string; __position: number; __queryID: string };

type InsightsClient = (
  method: InsightsClientMethod,
  payload: InsightsClientPayload
) => void;

type InsightsClientMethod =
  | 'clickedObjectIDsAfterSearch'
  | 'convertedObjectIDsAfterSearch';

type InsightsClientPayload = {
  index: string;
  queryID: string;
  eventName: string;
  objectIDs: string[];
  positions?: number[];
};

function inferPayload({
  method,
  results,
  currentHit,
}: {
  method: InsightsClientMethod;
  results: Results;
  currentHit: Hit;
}): Omit<InsightsClientPayload, 'eventName'> {
  const { index } = results;
  const queryID = currentHit.__queryID;
  const objectIDs = [currentHit.objectID];

  if (!queryID) {
    throw new Error(`Could not infer \`queryID\`. Ensure \`clickAnalytics: true\` was added with the Configure widget.
See: https://alg.li/VpPpLt`);
  }

  switch (method) {
    case 'clickedObjectIDsAfterSearch': {
      const positions = [currentHit.__position];
      return { index, queryID, objectIDs, positions };
    }

    case 'convertedObjectIDsAfterSearch':
      return { index, queryID, objectIDs };

    default:
      throw new Error(
        `Unsupported method "${method}" passed to the insights function. The supported methods are: "clickedObjectIDsAfterSearch", "convertedObjectIDsAfterSearch".`
      );
  }
}

const wrapInsightsClient =
  (aa: InsightsClient, results: Results, currentHit: Hit) =>
  (method: InsightsClientMethod, payload: Partial<InsightsClientPayload>) => {
    if (typeof aa !== 'function') {
      throw new TypeError(`Expected insightsClient to be a Function`);
    }
    const inferredPayload = inferPayload({ method, results, currentHit });
    aa(method, { ...inferredPayload, ...payload } as any);
  };

export default (insightsClient: InsightsClient) =>
  createConnector({
    displayName: 'AlgoliaInsights',

    getProvidedProps(props, _, searchResults) {
      const results: Results = getResults(searchResults, {
        ais: props.contextValue,
        multiIndexContext: props.indexContextValue,
      });

      const insights = wrapInsightsClient(insightsClient, results, props.hit);
      return { insights };
    },
  });
