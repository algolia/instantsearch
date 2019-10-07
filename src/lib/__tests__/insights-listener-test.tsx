/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import withInsightsListener from '../insights/listener';

describe('withInsightsListener', () => {
  it('should capture clicks performed on inner elements with data-insights-method defined', () => {
    const payload = btoa(
      JSON.stringify({ objectIDs: ['1'], eventName: 'Add to Cart' })
    );

    const Hits = () => (
      <div>
        <button
          data-insights-method="clickedObjectIDsAfterSearch"
          data-insights-payload={payload}
        >
          Add to Cart
        </button>
      </div>
    );

    const insights = jest.fn();

    const hits = [
      { objectID: '1' },
      { objectID: '2' },
      { objectID: '3' },
      { objectID: '4' },
      { objectID: '5' },
    ];

    const results = {
      index: 'theIndex',
      queryID: 'theQueryID',
      hitsPerPage: 2,
      page: 1,
    };

    const instantSearchInstance = {
      insightsClient: jest.fn(),
    };
    const HitsWithInsightsListener: any = withInsightsListener(Hits);
    const { container } = render(
      <HitsWithInsightsListener
        hits={hits}
        results={results}
        instantSearchInstance={instantSearchInstance}
        insights={insights}
      />
    );
    const button = container.querySelector('button') as HTMLButtonElement;

    fireEvent.click(button);

    expect(insights).toHaveBeenCalledTimes(1);
    expect(insights).toHaveBeenCalledWith('clickedObjectIDsAfterSearch', {
      eventName: 'Add to Cart',
      objectIDs: ['1'],
    });
  });

  it('should not capture clicks performed on inner elements with no data-insights-method defined', () => {
    const payload = btoa(
      JSON.stringify({ objectIDs: ['1'], eventName: 'Add to Cart' })
    );

    const Hits = () => (
      <div>
        <button data-insights-payload={payload}>Add to Cart</button>
      </div>
    );

    const insights = jest.fn();

    const hits = [
      { objectID: '1' },
      { objectID: '2' },
      { objectID: '3' },
      { objectID: '4' },
      { objectID: '5' },
    ];

    const results = {
      index: 'theIndex',
      queryID: 'theQueryID',
      hitsPerPage: 2,
      page: 1,
    };

    const instantSearchInstance = {
      insightsClient: jest.fn(),
    };
    const HitsWithInsightsListener: any = withInsightsListener(Hits);
    const { container } = render(
      <HitsWithInsightsListener
        hits={hits}
        results={results}
        instantSearchInstance={instantSearchInstance}
        insights={insights}
      />
    );
    const button = container.querySelector('button') as HTMLButtonElement;

    fireEvent.click(button);

    expect(insights).toHaveBeenCalledTimes(0);
  });
});
