import algoliasearchHelper, { SearchResults } from 'algoliasearch-helper';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { InstantSearch, InitOptions, RenderOptions } from '../../../types';
import connectInfiniteHitsWithInsights from '../connectInfiniteHitsWithInsights';

jest.mock('../../../lib/utils/hits-absolute-position', () => ({
  addAbsolutePosition: hits => hits,
}));

describe('connectInfiniteHitsWithInsights', () => {
  const createInstantSearchWithInsights = (): InstantSearch =>
    createInstantSearch({
      insightsClient() {},
    });

  const createInitOptionsWithInsights = (
    args: Partial<InitOptions>
  ): InitOptions =>
    createInitOptions({
      instantSearchInstance: createInstantSearchWithInsights(),
      ...args,
    });

  const createRenderOptionsWithInsights = (
    args: Partial<RenderOptions>
  ): RenderOptions =>
    createRenderOptions({
      instantSearchInstance: createInstantSearchWithInsights(),
      ...args,
    });

  it('should expose `insights` props', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHitsWithInsights(rendering, jest.fn());
    const widget = makeWidget({});

    const helper = algoliasearchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptionsWithInsights({
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
      createRenderOptionsWithInsights({
        state: helper.state,
        results,
        helper,
      })
    );

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.insights).toBeInstanceOf(Function);
  });

  it('should preserve props exposed by connectInfiniteHits', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHitsWithInsights(rendering, jest.fn());
    const widget = makeWidget({});

    const helper = algoliasearchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptionsWithInsights({
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
      createRenderOptionsWithInsights({
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
    // @ts-ignore:next-line
    const makeWidget = connectInfiniteHitsWithInsights(rendering);
    const helper = algoliasearchHelper(createSearchClient(), '', {});
    const widget = makeWidget({});
    expect(() =>
      widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
    ).not.toThrow();
  });
});
