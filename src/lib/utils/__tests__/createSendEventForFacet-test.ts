import algoliasearchHelper from 'algoliasearch-helper';
import { createSendEventForFacet } from '../createSendEventForFacet';
import { InstantSearch, SearchClient } from '../../../types';

jest.mock('../isFacetRefined', () => jest.fn());

import isFacetRefined from '../isFacetRefined';

const instantSearchInstance = {} as InstantSearch;
let sendEvent;
let helper;
beforeEach(() => {
  instantSearchInstance.sendEventToInsights = jest.fn();
  helper = algoliasearchHelper({} as SearchClient, '', {});
  (isFacetRefined as jest.Mock).mockImplementation(() => false);
  sendEvent = createSendEventForFacet({
    instantSearchInstance,
    helper,
    attribute: 'category',
    widgetType: 'ais.customWidget',
  });
});

describe('createSendEventForFacet', () => {
  describe('Usage', () => {
    it('throws when facetValue is missing', () => {
      expect(() => {
        sendEvent('click');
      }).toThrowErrorMatchingInlineSnapshot(`
"You need to pass two arguments like:
  sendEvent('click', facetValue);

If you want to send a custom payload, you can pass one object: sendEvent(customPayload);
"
`);
    });

    it('throws with unknown eventType', () => {
      expect(() => {
        sendEvent('my custom event type');
      }).toThrowErrorMatchingInlineSnapshot(`
"You need to pass two arguments like:
  sendEvent('click', facetValue);

If you want to send a custom payload, you can pass one object: sendEvent(customPayload);
"
`);
    });

    it('throws when eventType is not click', () => {
      expect(() => {
        sendEvent('custom event type');
      }).toThrowErrorMatchingInlineSnapshot(`
"You need to pass two arguments like:
  sendEvent('click', facetValue);

If you want to send a custom payload, you can pass one object: sendEvent(customPayload);
"
`);
    });

    it('does not send event when a facet is removed', () => {
      (isFacetRefined as jest.Mock).mockImplementation(() => true);
      sendEvent('click', 'value');
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        0
      );
    });

    it('sends with default eventName', () => {
      sendEvent('click', 'value');
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        1
      );
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
        eventType: 'click',
        insightsMethod: 'clickedFilters',
        payload: {
          eventName: 'Filter Applied',
          filters: ['category:"value"'],
          index: '',
        },
        widgetType: 'ais.customWidget',
      });
    });

    it('sends with custom eventName', () => {
      sendEvent('click', 'value', 'Category Clicked');
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        1
      );
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
        eventType: 'click',
        insightsMethod: 'clickedFilters',
        payload: {
          eventName: 'Category Clicked',
          filters: ['category:"value"'],
          index: '',
        },
        widgetType: 'ais.customWidget',
      });
    });
  });
});
