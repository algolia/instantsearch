import withInsights from '../client';
import { warning } from '../../utils';

describe('withInsights', () => {
  it('shows a deprecation warning', () => {
    warning.cache = {};

    const renderer = ({ insights }) => {
      insights('convertedObjectIDsAfterSearch', {
        objectIDs: ['1'],
        eventName: 'Add to basket',
      });
    };
    const connector = renderFn => () => ({
      init() {
        renderFn({
          results: {},
          hits: [
            { objectID: '1', __queryID: 'theQueryID', __position: 9 },
            { objectID: '2', __queryID: 'theQueryID', __position: 10 },
            { objectID: '3', __queryID: 'theQueryID', __position: 11 },
            { objectID: '4', __queryID: 'theQueryID', __position: 12 },
          ],
          instantSearchInstance: { insightsClient: () => {} },
        });
      },
    });
    const makeWidget = withInsights(connector)(renderer);
    const widget = makeWidget();
    expect(() => {
      widget.init();
    }).toWarnDev(
      `[InstantSearch.js]: \`insights\` function has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the \`insights\` middleware.

For more information, visit https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/how-to/send-click-and-conversion-events-with-instantsearch/js/`
    );
  });
});
