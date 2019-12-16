import connectConfigureRelatedItems from '../connectConfigureRelatedItems';
import connectConfigure from '../../configure/connectConfigure';
import { castToJestMock } from '../../../../test/utils/castToJestMock';

jest.mock('../../configure/connectConfigure');

// This test ensures that the `connectConfigureRelatedItems` calls
// `connectConfigure` to compute the search parameters.
describe('connectConfigureRelatedItems - bridge', () => {
  test('forwards the options to connectConfigure', () => {
    const makeWidget = jest.fn();
    castToJestMock(connectConfigure).mockImplementationOnce(() => makeWidget);

    const renderer = jest.fn();
    const unmounter = jest.fn();
    const configureRelatedItems = connectConfigureRelatedItems(
      renderer,
      unmounter
    );

    configureRelatedItems({
      hit: { objectID: '1' },
      matchingPatterns: {},
    });

    expect(connectConfigure).toHaveBeenCalledTimes(1);
    expect(connectConfigure).toHaveBeenCalledWith(renderer, unmounter);

    expect(makeWidget).toHaveBeenCalledTimes(1);
    expect(makeWidget).toHaveBeenCalledWith({
      searchParameters: expect.objectContaining({
        facetFilters: ['objectID:-1'],
        optionalFilters: [],
        sumOrFiltersScores: true,
      }),
    });
  });
});
