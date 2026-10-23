import { isFacetRefined } from './isFacetRefined';

import type { InstantSearch } from '../../types';
import type { AlgoliaSearchHelper } from 'algoliasearch-helper';

type BuiltInSendEventForFacet = (
  eventType: string,
  facetValue: string,
  eventName?: string,
  additionalData?: Record<string, any>
) => void;
type CustomSendEventForFacet = (customPayload: any) => void;

export type SendEventForFacet = BuiltInSendEventForFacet &
  CustomSendEventForFacet;

type CreateSendEventForFacetOptions = {
  instantSearchInstance: InstantSearch;
  helper: AlgoliaSearchHelper;
  attribute: string | ((facetValue: string) => string);
  widgetType: string;
};

export function createSendEventForFacet({
  instantSearchInstance,
  helper,
  attribute: attr,
  widgetType,
}: CreateSendEventForFacetOptions): SendEventForFacet {
  const sendEventForFacet: SendEventForFacet = (...args: any[]) => {
    const [, facetValue, eventName = 'Filter Applied', additionalData = {}] =
      args;
    const [eventType, eventModifier]: [string, string] = args[0].split(':');
    const attribute = typeof attr === 'string' ? attr : attr(facetValue);

    if (args.length === 1 && typeof args[0] === 'object') {
      instantSearchInstance.sendEventToInsights(args[0]);
    } else if (eventType === 'click' && args.length >= 2 && args.length <= 4) {
      if (!isFacetRefined(helper, attribute, facetValue)) {
        // send event only when the facet is being checked "ON"
        instantSearchInstance.sendEventToInsights({
          insightsMethod: 'clickedFilters',
          widgetType,
          eventType,
          eventModifier,
          payload: {
            eventName,
            index: helper.lastResults?.index || helper.state.index,
            filters: [`${attribute}:${facetValue}`],
            ...additionalData,
          },
          attribute,
        });
      }
    } else if (__DEV__) {
      throw new Error(
        `You need to pass between two and four arguments like:
  sendEvent('click', facetValue, eventName?, additionalData?);

If you want to send a custom payload, you can pass one object: sendEvent(customPayload);
`
      );
    }
  };

  return sendEventForFacet;
}
