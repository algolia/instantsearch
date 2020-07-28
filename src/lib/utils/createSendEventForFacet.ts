import { AlgoliaSearchHelper } from 'algoliasearch-helper';
import { InstantSearch } from '../../types';
import isFacetRefined from './isFacetRefined';

export default function createSendEventForFacet(
  instantSearchInstance: InstantSearch,
  helper: AlgoliaSearchHelper,
  attribute: string
) {
  return (eventType, facetValue) => {
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
  };
}
