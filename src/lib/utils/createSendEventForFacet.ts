import { AlgoliaSearchHelper } from 'algoliasearch-helper';
import { InstantSearch } from '../../types';
import isFacetRefined from './isFacetRefined';

type BuiltInSendEventForFacet = (eventType: string, facetValue: string) => void;
type CustomSendEventForFacet = (customPayload: any) => void;

type SendEventForFacet = BuiltInSendEventForFacet & CustomSendEventForFacet;

export default function createSendEventForFacet({
  instantSearchInstance,
  helper,
  attribute,
  widgetType,
}: {
  instantSearchInstance: InstantSearch;
  helper: AlgoliaSearchHelper;
  attribute: string;
  widgetType: string;
}): SendEventForFacet {
  const sendEventForFacet: SendEventForFacet = (...args) => {
    if (args.length === 2) {
      const [eventType, facetValue] = args;
      if (!isFacetRefined(helper, attribute, facetValue)) {
        instantSearchInstance.sendEventToInsights({
          insightsMethod: 'clickedFilters',
          widgetType,
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
(eventType = 'click')

If you want to send a custom payload, you can pass one object: sendEvent(customPayload);
`);
    }
  };
  return sendEventForFacet;
}
