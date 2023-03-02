import {
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import algoliasearchHelper, { SearchResults } from 'algoliasearch-helper';

import { createInstantSearch } from '../../../../test/createInstantSearch';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import connectHitsWithInsights from '../connectHitsWithInsights';

import type { Hit } from '../../../types';

jest.mock('../../../lib/utils/hits-absolute-position', () => ({
  addAbsolutePosition: (hits: Hit[]) => hits,
}));

describe('connectHitsWithInsights', () => {
  it('should expose `insights` props', () => {
    const instantSearchInstance = createInstantSearch({
      insightsClient() {},
    });

    const rendering = jest.fn();
    const makeWidget = connectHitsWithInsights(rendering, jest.fn());
    const widget = makeWidget({});

    const helper = algoliasearchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        instantSearchInstance,
        state: helper.state,
        helper,
      })
    );

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.insights).toBeUndefined();

    const hits = [
      { fake: 'data', objectID: '1' },
      { sample: 'infos', objectID: '2' },
    ];
    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({ hits }),
    ]);

    widget.render!(
      createRenderOptions({
        instantSearchInstance,
        state: helper.state,
        results,
        helper,
      })
    );

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.insights).toBeInstanceOf(Function);
  });

  it('should preserve props exposed by connectHits', () => {
    const rendering = jest.fn();
    const makeWidget = connectHitsWithInsights(rendering, jest.fn());
    const widget = makeWidget({});

    const helper = algoliasearchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        state: helper.state,
        helper,
      })
    );

    const hits = [
      { fake: 'data', objectID: '1' },
      { sample: 'infos', objectID: '2' },
    ];
    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({ hits }),
    ]);

    widget.render!(
      createRenderOptions({
        state: helper.state,
        results,
        helper,
      })
    );

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.hits).toEqual(expect.objectContaining(hits));
    expect(secondRenderingOptions.results).toEqual(results);
  });

  it('does not throw without the unmount function', () => {
    const rendering = () => {};
    const makeWidget = connectHitsWithInsights(rendering);
    const widget = makeWidget({});
    const helper = algoliasearchHelper(createSearchClient(), '', {});
    expect(() => {
      widget.dispose!(createDisposeOptions({ helper, state: helper.state }));
    }).not.toThrow();
  });
});
