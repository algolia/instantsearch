import configureRelatedItems from '../configure-related-items';
import connectConfigureRelatedItems from '../../../connectors/configure-related-items/connectConfigureRelatedItems';
import { castToJestMock } from '../../../../test/utils/castToJestMock';

jest.mock(
  '../../../connectors/configure-related-items/connectConfigureRelatedItems'
);

describe('configureRelatedItems', () => {
  test('forwards the options to the connector', () => {
    const makeWidget = jest.fn();
    castToJestMock(connectConfigureRelatedItems).mockImplementationOnce(
      () => makeWidget
    );

    const widgetParams = {
      hit: { objectID: '1' },
      matchingPatterns: {},
      transformSearchParameters: x => x,
    };

    configureRelatedItems(widgetParams);

    expect(connectConfigureRelatedItems).toHaveBeenCalledTimes(1);
    expect(makeWidget).toHaveBeenCalledTimes(1);
    expect(makeWidget).toHaveBeenCalledWith(widgetParams);
  });
});
