import { AlgoliaSearchHelper } from 'algoliasearch-helper';
import { InstantSearch } from '../../types';
import isFacetRefined from './isFacetRefined';

type BuiltInSendEventForFacet = (eventType: string, facetValue: string) => void;
type CustomSendEventForFacet = (customPayload: any) => void;

type SendEventForFacet = BuiltInSendEventForFacet & CustomSendEventForFacet;

export default function createSendEventForFacet(
  instantSearchInstance: InstantSearch,
  helper: AlgoliaSearchHelper,
  attribute: string
): SendEventForFacet {
  const sendEventForFacet: SendEventForFacet = (...args) => {
    if (args.length === 2) {
      const [eventType, facetValue] = args;
      if (!isFacetRefined(helper, attribute, facetValue)) {
        instantSearchInstance.sendEventToInsights({
          insightsMethod: 'clickedFilters',
          widgetType: 'ais.refinementList',
          eventType,
          payload: {
            eventName: 'Item List Filtered',
            index: helper.getIndex(),
            filters: [`${attribute}:${JSON.stringify(facetValue)}`],
          },
        });
      }
    } else if (args.length === 1) {
      instantSearchInstance.sendEventToInsights(args[0]);
    } else {
      throw new Error(`You need to pass two arguments: eventType, facetValue.

For example: sendEvent('click', facetValue);

If you want to send a custom payload, you can pass one object: sendEvent(customPayload);
`);
    }
  };
  return sendEventForFacet;
}
