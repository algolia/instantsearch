/**
 * @jest-environment jsdom
 */
/** @jsx createElement */
import { fireEvent, render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { Fragment, createElement } from 'preact';

import { createHitsComponent } from '../Hits';

import type { HitsProps } from '../Hits';
import type { Hit } from 'instantsearch.js';

describe('Hits', () => {
  const Hits = createHitsComponent({ createElement, Fragment });
  function createProps<THit extends Hit = Hit>(
    props: Omit<Partial<HitsProps<THit>>, 'sendEvent'>
  ): Omit<HitsProps<THit>, 'sendEvent'> & {
    sendEvent: jest.Mock;
  } {
    return {
      hits: [
        { objectID: 'abc', __position: 1 },
        { objectID: 'def', __position: 2 },
      ] as THit[],
      sendEvent: jest.fn(),
      itemComponent: ({ hit, index: _index, ...itemProps }) => (
        <li key={hit.objectID} {...itemProps}>
          {hit.objectID}
        </li>
      ),
      ...props,
    };
  }

  test('renders with default props', () => {
    const props = createProps({});
    const { container } = render(<Hits {...props} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Hits"
        >
          <ol
            class="ais-Hits-list"
          >
            <li
              class="ais-Hits-item"
            >
              abc
            </li>
            <li
              class="ais-Hits-item"
            >
              def
            </li>
          </ol>
        </div>
      </div>
    `);
  });

  test('forwards `div` props to the root element', () => {
    const props = createProps({
      hidden: true,
    });
    const { container } = render(<Hits {...props} />);
    expect(container.querySelector<HTMLDivElement>('.ais-Hits')!.hidden).toBe(
      true
    );
  });

  test('accepts custom class names', () => {
    const props = createProps({
      className: 'MyCustomHits',
      classNames: {
        root: ['ROOT-A', 'ROOT-B'],
        list: 'LIST',
        item: 'ITEM',
      },
    });
    const { container } = render(<Hits {...props} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Hits ROOT-A ROOT-B MyCustomHits"
        >
          <ol
            class="ais-Hits-list LIST"
          >
            <li
              class="ais-Hits-item ITEM"
            >
              abc
            </li>
            <li
              class="ais-Hits-item ITEM"
            >
              def
            </li>
          </ol>
        </div>
      </div>
    `);
  });

  test('accepts custom class names (empty)', () => {
    const props = createProps({
      hits: [],
      className: 'MyCustomHits',
      classNames: {
        root: 'ROOT',
        emptyRoot: 'EMPTYROOT',
        list: 'LIST',
      },
    });
    const { container } = render(<Hits {...props} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Hits ROOT ais-Hits--empty EMPTYROOT MyCustomHits"
        >
          <ol
            class="ais-Hits-list LIST"
          />
        </div>
      </div>
    `);
  });

  test('sends a default `click` event when clicking on a hit', () => {
    const props = createProps({});
    const { container } = render(<Hits {...props} />);

    userEvent.click(container.querySelectorAll('.ais-Hits-item')[0]!);
    expect(props.sendEvent).toHaveBeenCalledTimes(1);
    expect(props.sendEvent).toHaveBeenLastCalledWith(
      'click:internal',
      props.hits[0],
      'Hit Clicked'
    );
  });

  describe('itemComponent', () => {
    test('renders with props', () => {
      const props = createProps({
        hits: [{ objectID: 'abc', __position: 1, custom: 'value' }],
        itemComponent: jest.fn(({ hit, index, ...itemProps }) => (
          <li {...itemProps}>
            {hit.objectID}:{hit.custom}
          </li>
        )),
      });
      const { container } = render(<Hits {...props} />);

      // Class name is applied to the item component
      expect(container.querySelector('li')).toHaveClass('ais-Hits-item');

      // Hit is passed to the item component
      expect(props.itemComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          hit: props.hits[0],
        }),
        {}
      );
      expect(container.querySelector('.ais-Hits-item')).toMatchInlineSnapshot(`
        <li
          class="ais-Hits-item"
        >
          abc
          :
          value
        </li>
      `);

      // Click event is sent when clicking on the item component
      userEvent.click(container.querySelector('.ais-Hits-item')!);
      expect(props.sendEvent).toHaveBeenCalledTimes(1);

      // AuxClick event is sent when clicking on the item component
      // with the middle mouse button
      props.sendEvent.mockClear();
      fireEvent(
        container.querySelector('.ais-Hits-item')!,
        new MouseEvent('auxclick', {
          button: 1,
        })
      );
      expect(props.sendEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe('emptyComponent', () => {
    test('renders when defined and there are no hits', () => {
      const props = createProps({
        hits: [],
        emptyComponent: ({ ...rootProps }) => (
          <div {...rootProps}>No results</div>
        ),
      });
      const { container } = render(<Hits {...props} />);
      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            class="ais-Hits ais-Hits--empty"
          >
            No results
          </div>
        </div>
      `);
    });
  });
});
