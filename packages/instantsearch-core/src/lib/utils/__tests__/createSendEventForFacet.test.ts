import { castToJestMock } from '@instantsearch/testutils/castToJestMock';
import algoliasearchHelper from 'algoliasearch-helper';
import { createInstantSearch } from 'instantsearch-core/test/createInstantSearch';

import { isFacetRefined } from '../../public/isFacetRefined';
import { createSendEventForFacet } from '../createSendEventForFacet';

import type { SearchClient } from '../../../types';

jest.mock('../../public/isFacetRefined', () => ({ isFacetRefined: jest.fn() }));

const createTestEnvironment = () => {
  const instantSearchInstance = createInstantSearch();
  const helper = algoliasearchHelper({} as SearchClient, '', {});
  castToJestMock(isFacetRefined).mockImplementation(() => false);
  const sendEvent = createSendEventForFacet({
    instantSearchInstance,
    helper,
    attribute: 'category',
    widgetType: 'ais.customWidget',
  });

  return {
    instantSearchInstance,
    helper,
    sendEvent,
  };
};

describe('createSendEventForFacet', () => {
  describe('Usage', () => {
    it('throws when facetValue is missing', () => {
      const { sendEvent } = createTestEnvironment();
      expect(() => {
        sendEvent('click');
      }).toThrowErrorMatchingInlineSnapshot(`
        "You need to pass between two and four arguments like:
        sendEvent('click', facetValue, eventName?, additionalData?);

        If you want to send a custom payload, you can pass one object: sendEvent(customPayload);"
      `);
    });

    it('throws with unknown eventType', () => {
      const { sendEvent } = createTestEnvironment();
      expect(() => {
        sendEvent('my custom event type');
      }).toThrowErrorMatchingInlineSnapshot(`
        "You need to pass between two and four arguments like:
        sendEvent('click', facetValue, eventName?, additionalData?);

        If you want to send a custom payload, you can pass one object: sendEvent(customPayload);"
      `);
    });

    it('throws when eventType is not click', () => {
      const { sendEvent } = createTestEnvironment();
      expect(() => {
        sendEvent('custom event type');
      }).toThrowErrorMatchingInlineSnapshot(`
        "You need to pass between two and four arguments like:
        sendEvent('click', facetValue, eventName?, additionalData?);

        If you want to send a custom payload, you can pass one object: sendEvent(customPayload);"
      `);
    });

    it('does not send event when a facet is removed', () => {
      const { sendEvent, instantSearchInstance } = createTestEnvironment();
      (isFacetRefined as jest.Mock).mockImplementation(() => true);
      sendEvent('click', 'value');
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        0
      );
    });

    it('sends with default eventName', () => {
      const { sendEvent, instantSearchInstance } = createTestEnvironment();
      sendEvent('click', 'value');
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        1
      );
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
        attribute: 'category',
        eventType: 'click',
        insightsMethod: 'clickedFilters',
        payload: {
          eventName: 'Filter Applied',
          filters: ['category:value'],
          index: '',
        },
        widgetType: 'ais.customWidget',
      });
    });

    it('sends with internal eventName', () => {
      const { sendEvent, instantSearchInstance } = createTestEnvironment();
      sendEvent('click:internal', 'value');
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        1
      );
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
        attribute: 'category',
        eventType: 'click',
        eventModifier: 'internal',
        insightsMethod: 'clickedFilters',
        payload: {
          eventName: 'Filter Applied',
          filters: ['category:value'],
          index: '',
        },
        widgetType: 'ais.customWidget',
      });
    });

    it('sends with custom eventName', () => {
      const { sendEvent, instantSearchInstance } = createTestEnvironment();
      sendEvent('click', 'value', 'Category Clicked');
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        1
      );
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
        attribute: 'category',
        eventType: 'click',
        insightsMethod: 'clickedFilters',
        payload: {
          eventName: 'Category Clicked',
          filters: ['category:value'],
          index: '',
        },
        widgetType: 'ais.customWidget',
      });
    });

    it('sends with additional data', () => {
      const { sendEvent, instantSearchInstance } = createTestEnvironment();
      const additionalData = {
        customData: 'customValue',
        customData2: true,
      };

      sendEvent('click', 'value', 'Category Clicked', additionalData);
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        1
      );
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
        attribute: 'category',
        eventType: 'click',
        insightsMethod: 'clickedFilters',
        payload: {
          eventName: 'Category Clicked',
          filters: ['category:value'],
          index: '',
          ...additionalData,
        },
        widgetType: 'ais.customWidget',
      });
    });
  });
});
