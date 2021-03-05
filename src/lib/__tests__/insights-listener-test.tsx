/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import withInsightsListener from '../insights/listener';
import { serializePayload } from '../../lib/utils';

describe('withInsightsListener', () => {
  it('should capture clicks performed on inner elements with data-insights-method defined', () => {
    const payload = serializePayload({
      objectIDs: ['1'],
      eventName: 'Add to Cart',
    });

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

  it('should capture clicks performed on inner elements whose parents have data-insights-method defined', () => {
    const payload = serializePayload({
      objectIDs: ['1'],
      eventName: 'Product Clicked',
    });

    const Hits = () => (
      <div>
        <a
          data-insights-method="clickedObjectIDsAfterSearch"
          data-insights-payload={payload}
        >
          <h1> Product 1 </h1>
        </a>
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
    const innerChild = container.querySelector('h1') as HTMLElement;

    fireEvent.click(innerChild);

    expect(insights).toHaveBeenCalledTimes(1);
    expect(insights).toHaveBeenCalledWith('clickedObjectIDsAfterSearch', {
      eventName: 'Product Clicked',
      objectIDs: ['1'],
    });
  });

  it('should not capture clicks performed on inner elements with no data-insights-method defined', () => {
    const payload = serializePayload({
      objectIDs: ['1'],
      eventName: 'Add to Cart',
    });

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
