import jsHelper, { SearchResults } from 'algoliasearch-helper';
import connectHitsWithInsights from '../connectHitsWithInsights';

jest.mock('../../../lib/utils/hits-absolute-position', () => ({
  addAbsolutePosition: hits => hits,
}));

describe('connectHitsWithInsights', () => {
  it('should expose `insights` props', () => {
    const rendering = jest.fn();
    const makeWidget = connectHitsWithInsights(rendering);
    const widget = makeWidget();

    const helper = jsHelper({}, '', {});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
      instantSearchInstance: {
        insightsClient: jest.fn(),
      },
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.insights).toBeUndefined();

    const hits = [{ fake: 'data' }, { sample: 'infos' }];
    const results = new SearchResults(helper.state, [{ hits }]);
    widget.render({
      results,
      state: helper.state,
      helper,
      createURL: () => '#',
      instantSearchInstance: {
        insightsClient: jest.fn(),
      },
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.insights).toBeInstanceOf(Function);
  });
});
