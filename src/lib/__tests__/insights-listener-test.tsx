import React from 'react';
import withInsightsListener from '../insights/listener';
import { mount } from 'enzyme';

describe('withInsightsListener', () => {
  it('should capture clicks performed on inner elements with data-insights-method defined', () => {
    const payload = btoa(
      JSON.stringify({ objectIDs: ['1'], eventName: 'Add to Cart' })
    );

    const Hits = (): React.ReactNode => (
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
    const wrapper = mount(
      <HitsWithInsightsListener
        hits={hits}
        results={results}
        instantSearchInstance={instantSearchInstance}
        insights={insights}
      />
    );

    wrapper.find('button').simulate('click');
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

    const Hits = (): React.ReactNode => (
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
    const wrapper = mount(
      <HitsWithInsightsListener
        hits={hits}
        results={results}
        instantSearchInstance={instantSearchInstance}
        insights={insights}
      />
    );

    wrapper.find('button').simulate('click');
    expect(insights).toHaveBeenCalledTimes(0);
  });
});
