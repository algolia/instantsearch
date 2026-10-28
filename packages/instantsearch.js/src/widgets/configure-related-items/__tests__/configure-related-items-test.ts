import { castToJestMock } from '@instantsearch/testutils/castToJestMock';
import { connectConfigureRelatedItems } from 'instantsearch-core';

import configureRelatedItems from '../configure-related-items';

import type { ConfigureRelatedItemsConnectorParams } from 'instantsearch-core';

jest.mock('instantsearch-core', () => ({
  ...jest.requireActual('instantsearch-core'),
  connectConfigureRelatedItems: jest.fn(),
}));

describe('configureRelatedItems', () => {
  test('forwards the options to the connector', () => {
    const makeWidget = jest.fn();
    castToJestMock(connectConfigureRelatedItems).mockImplementationOnce(
      () => makeWidget
    );

    const widgetParams: ConfigureRelatedItemsConnectorParams = {
      hit: { objectID: '1' },
      matchingPatterns: {},
      transformSearchParameters: (x) => x,
    };

    configureRelatedItems(widgetParams);

    expect(connectConfigureRelatedItems).toHaveBeenCalledTimes(1);
    expect(makeWidget).toHaveBeenCalledTimes(1);
    expect(makeWidget).toHaveBeenCalledWith(widgetParams);
  });
});
