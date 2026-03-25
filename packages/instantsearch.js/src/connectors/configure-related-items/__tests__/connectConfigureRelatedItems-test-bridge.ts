import { castToJestMock } from '@instantsearch/testutils/castToJestMock';

import connectConfigure from '../../configure/connectConfigure';
import connectConfigureRelatedItems from '../connectConfigureRelatedItems';

vi.mock('../../configure/connectConfigure');

// This test ensures that the `connectConfigureRelatedItems` calls
// `connectConfigure` to compute the search parameters.
describe('connectConfigureRelatedItems - bridge', () => {
  test('forwards the options to connectConfigure', () => {
    const makeWidget = vi.fn();
    castToJestMock(connectConfigure).mockImplementationOnce(() => makeWidget);

    const renderer = vi.fn();
    const unmounter = vi.fn();
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
