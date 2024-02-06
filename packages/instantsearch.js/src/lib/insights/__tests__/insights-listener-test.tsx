/**
 * @jest-environment jsdom
 */
/** @jsx h */

import { render, fireEvent } from '@testing-library/preact';
import { h } from 'preact';

import { createInstantSearch } from '../../../../test/createInstantSearch';
import {
  _buildEventPayloadsForHits,
  serializePayload,
} from '../../../lib/utils';
import withInsightsListener, { createInsightsEventHandler } from '../listener';

import type { InsightsEventHandlerOptions } from '../listener';

describe('createInsightsEventHandler', () => {
  describe('instantsearch.insights', () => {
    it('should capture clicks performed on inner elements with data-insights-method defined', () => {
      const payload = serializePayload({
        objectIDs: ['1'],
        eventName: 'Add to Cart',
      });

      const Hits = (props: InsightsEventHandlerOptions) => (
        <div onClick={createInsightsEventHandler(props)}>
          <button
            data-insights-method="clickedObjectIDsAfterSearch"
            data-insights-payload={payload}
          >
            Add to Cart
          </button>
        </div>
      );

      const props = {
        insights: jest.fn(),
        sendEvent: jest.fn(),
      };

      const { container } = render(
        <Hits insights={props.insights} sendEvent={props.sendEvent} />
      );
      const button = container.querySelector('button') as HTMLButtonElement;

      fireEvent.click(button);

      expect(props.insights).toHaveBeenCalledTimes(1);
      expect(props.insights).toHaveBeenCalledWith(
        'clickedObjectIDsAfterSearch',
        {
          eventName: 'Add to Cart',
          objectIDs: ['1'],
        }
      );
    });

    it('should capture clicks performed on inner elements whose parents have data-insights-method defined', () => {
      const payload = serializePayload({
        objectIDs: ['1'],
        eventName: 'Product Clicked',
      });

      const Hits = (props: InsightsEventHandlerOptions) => (
        <div onClick={createInsightsEventHandler(props)}>
          <a
            data-insights-method="clickedObjectIDsAfterSearch"
            data-insights-payload={payload}
          >
            <h1> Product 1 </h1>
          </a>
        </div>
      );

      const props = {
        insights: jest.fn(),
        sendEvent: jest.fn(),
      };

      const { container } = render(
        <Hits insights={props.insights} sendEvent={props.sendEvent} />
      );
      const innerChild = container.querySelector('h1') as HTMLElement;

      fireEvent.click(innerChild);

      expect(props.insights).toHaveBeenCalledTimes(1);
      expect(props.insights).toHaveBeenCalledWith(
        'clickedObjectIDsAfterSearch',
        {
          eventName: 'Product Clicked',
          objectIDs: ['1'],
        }
      );
    });

    it('should not capture clicks performed on inner elements with no data-insights-method defined', () => {
      const payload = serializePayload({
        objectIDs: ['1'],
        eventName: 'Add to Cart',
      });

      const Hits = (props: InsightsEventHandlerOptions) => (
        <div onClick={createInsightsEventHandler(props)}>
          <button data-insights-payload={payload}>Add to Cart</button>
        </div>
      );

      const props = {
        insights: jest.fn(),
        sendEvent: jest.fn(),
      };

      const { container } = render(
        <Hits insights={props.insights} sendEvent={props.sendEvent} />
      );
      const button = container.querySelector('button') as HTMLButtonElement;

      fireEvent.click(button);

      expect(props.insights).toHaveBeenCalledTimes(0);
    });
  });

  describe('sendEvent', () => {
    it('should capture clicks performed on inner elements with data-insights-event defined', () => {
      const payload = serializePayload(
        _buildEventPayloadsForHits({
          widgetType: 'ais.hits',
          getIndex: () => 'instant_search',
          instantSearchInstance: createInstantSearch(),
          methodName: 'bindEvent',
          args: ['click', { objectID: '1', __position: 1 }, 'Hit Clicked'],
        })
      );

      const Hits = (props: InsightsEventHandlerOptions) => (
        <div onClick={createInsightsEventHandler(props)}>
          <button data-insights-event={payload}>Add to Cart</button>
        </div>
      );

      const props = {
        insights: jest.fn(),
        sendEvent: jest.fn(),
      };

      const { container } = render(
        <Hits insights={props.insights} sendEvent={props.sendEvent} />
      );
      const button = container.querySelector('button') as HTMLButtonElement;

      fireEvent.click(button);

      expect(props.sendEvent).toHaveBeenCalledTimes(1);
      expect(props.sendEvent).toHaveBeenCalledWith({
        eventType: 'click',
        hits: [{ objectID: '1', __position: 1 }],
        insightsMethod: 'clickedObjectIDsAfterSearch',
        payload: {
          eventName: 'Hit Clicked',
          index: 'instant_search',
          objectIDs: ['1'],
          positions: [1],
        },
        widgetType: 'ais.hits',
      });
    });

    it('should capture clicks performed on inner elements whose parents have data-insights-event defined', () => {
      const payload = serializePayload(
        _buildEventPayloadsForHits({
          widgetType: 'ais.hits',
          getIndex: () => 'instant_search',
          instantSearchInstance: createInstantSearch(),
          methodName: 'bindEvent',
          args: ['click', { objectID: '1', __position: 1 }, 'Hit Clicked'],
        })
      );

      const Hits = (props: InsightsEventHandlerOptions) => (
        <div onClick={createInsightsEventHandler(props)}>
          <button data-insights-event={payload}>
            <h1>Add to Cart</h1>
          </button>
        </div>
      );

      const props = {
        insights: jest.fn(),
        sendEvent: jest.fn(),
      };

      const { container } = render(
        <Hits insights={props.insights} sendEvent={props.sendEvent} />
      );
      const heading = container.querySelector('h1') as HTMLHeadingElement;

      fireEvent.click(heading);

      expect(props.sendEvent).toHaveBeenCalledTimes(1);
      expect(props.sendEvent).toHaveBeenCalledWith({
        eventType: 'click',
        hits: [{ objectID: '1', __position: 1 }],
        insightsMethod: 'clickedObjectIDsAfterSearch',
        payload: {
          eventName: 'Hit Clicked',
          index: 'instant_search',
          objectIDs: ['1'],
          positions: [1],
        },
        widgetType: 'ais.hits',
      });
    });

    it('should not capture clicks performed on inner elements with no data-insights-event defined', () => {
      const Hits = (props: InsightsEventHandlerOptions) => (
        <div onClick={createInsightsEventHandler(props)}>
          <button>Add to Cart</button>
        </div>
      );

      const props = {
        insights: jest.fn(),
        sendEvent: jest.fn(),
      };

      const { container } = render(
        <Hits insights={props.insights} sendEvent={props.sendEvent} />
      );
      const button = container.querySelector('button') as HTMLButtonElement;

      fireEvent.click(button);

      expect(props.sendEvent).not.toHaveBeenCalled();
    });
  });

  describe('combined', () => {
    it('should capture clicks performed on inner elements with both data-insights-method and data-insights-event defined', () => {
      const legacyPayload = serializePayload({
        objectIDs: ['1'],
        eventName: 'Product Clicked',
      });
      const modernPayload = serializePayload(
        _buildEventPayloadsForHits({
          widgetType: 'ais.hits',
          getIndex: () => 'instant_search',
          instantSearchInstance: createInstantSearch(),
          methodName: 'bindEvent',
          args: ['click', { objectID: '1', __position: 1 }, 'Product Clicked'],
        })
      );

      const Hits = (props: InsightsEventHandlerOptions) => (
        <div onClick={createInsightsEventHandler(props)}>
          <button
            data-insights-method="clickedObjectIDsAfterSearch"
            data-insights-payload={legacyPayload}
            data-insights-event={modernPayload}
          >
            <h1>Add to Cart</h1>
          </button>
        </div>
      );

      const props = {
        insights: jest.fn(),
        sendEvent: jest.fn(),
      };

      const { container } = render(
        <Hits insights={props.insights} sendEvent={props.sendEvent} />
      );
      const heading = container.querySelector('h1') as HTMLHeadingElement;

      fireEvent.click(heading);

      expect(props.insights).toHaveBeenCalledTimes(1);
      expect(props.insights).toHaveBeenCalledWith(
        'clickedObjectIDsAfterSearch',
        {
          eventName: 'Product Clicked',
          objectIDs: ['1'],
        }
      );

      expect(props.sendEvent).toHaveBeenCalledTimes(1);
      expect(props.sendEvent).toHaveBeenCalledWith({
        eventType: 'click',
        hits: [{ objectID: '1', __position: 1 }],
        insightsMethod: 'clickedObjectIDsAfterSearch',
        payload: {
          eventName: 'Product Clicked',
          index: 'instant_search',
          objectIDs: ['1'],
          positions: [1],
        },
        widgetType: 'ais.hits',
      });
    });
  });
});

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
