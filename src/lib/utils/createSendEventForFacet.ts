import { AlgoliaSearchHelper } from 'algoliasearch-helper';
import { InstantSearch } from '../../types';
import isFacetRefined from './isFacetRefined';

type BuiltInSendEventForFacet = (
  eventType: string,
  facetValue: string,
  eventName?: string
) => void;
type CustomSendEventForFacet = (customPayload: any) => void;

export type SendEventForFacet = BuiltInSendEventForFacet &
  CustomSendEventForFacet;

export function createSendEventForFacet({
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
    const [eventType, facetValue, eventName = 'Filter Applied'] = args;
    if (args.length === 1 && typeof args[0] === 'object') {
      instantSearchInstance.sendEventToInsights(args[0]);
    } else if (
      eventType === 'click' &&
      (args.length === 2 || args.length === 3)
    ) {
      if (!isFacetRefined(helper, attribute, facetValue)) {
        // send event only when the facet is being checked "ON"
        instantSearchInstance.sendEventToInsights({
          insightsMethod: 'clickedFilters',
          widgetType,
          eventType,
          payload: {
            eventName,
            index: helper.getIndex(),
            filters: [`${attribute}:${facetValue}`],
          },
          attribute,
        });
      }
    } else if (__DEV__) {
      throw new Error(
        `You need to pass two arguments like:
  sendEvent('click', facetValue);

If you want to send a custom payload, you can pass one object: sendEvent(customPayload);
`
      );
    }
  };
  return sendEventForFacet;
}
