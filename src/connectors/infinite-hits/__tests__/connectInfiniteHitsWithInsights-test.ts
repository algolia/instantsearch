import jsHelper, { SearchResults } from 'algoliasearch-helper';
import connectInfiniteHitsWithInsights from '../connectInfiniteHitsWithInsights';
import { Client } from '../../../types';

jest.mock('../../../lib/utils/hits-absolute-position', () => ({
  addAbsolutePosition: hits => hits,
}));

describe('connectInfiniteHitsWithInsights', () => {
  const defaultInitOptions = {
    instantSearchInstance: {
      helper: null,
      widgets: [],
      insightsClient: () => {},
    },
    templatesConfig: {},
    createURL: () => '#',
  };

  const defaultRenderOptions = {
    instantSearchInstance: {
      helper: null,
      widgets: [],
      insightsClient: () => {},
    },
    templatesConfig: {},
    searchMetadata: { isSearchStalled: false },
    createURL: () => '#',
  };

  it('should expose `insights` props', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHitsWithInsights(rendering, jest.fn());
    const widget = makeWidget({});

    const helper = jsHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!({
      ...defaultInitOptions,
      helper,
      state: helper.state,
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.insights).toBeUndefined();

    const hits = [{ fake: 'data' }, { sample: 'infos' }];
    const results = new SearchResults(helper.state, [{ hits }]);
    widget.render!({
      ...defaultRenderOptions,
      results,
      state: helper.state,
      helper,
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.insights).toBeInstanceOf(Function);
  });

  it('should preserve props exposed by connectInfiniteHits', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteHitsWithInsights(rendering, jest.fn());
    const widget = makeWidget({});

    const helper = jsHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!({
      ...defaultInitOptions,
      helper,
      state: helper.state,
    });

    const hits = [{ fake: 'data' }, { sample: 'infos' }];
    const results = new SearchResults(helper.state, [{ hits }]);
    widget.render!({
      ...defaultRenderOptions,
      results,
      state: helper.state,
      helper,
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.hits).toEqual(expect.objectContaining(hits));
    expect(secondRenderingOptions.results).toEqual(results);
  });
});
