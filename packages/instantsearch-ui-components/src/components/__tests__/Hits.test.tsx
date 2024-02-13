/**
 * @jest-environment jsdom
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { Fragment, createElement } from 'preact';

import { createHits } from '../Hits';

import type { HitsProps } from '../Hits';
import type { Hit } from 'instantsearch.js';

describe('Hits', () => {
  const Hits = createHits({ createElement, Fragment });
  function createProps<THit extends Hit = Hit>(
    props: Partial<HitsProps<THit>>
  ): HitsProps<THit> {
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

  test('renders with custom div props', () => {
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
        root: 'ROOT',
        list: 'LIST',
        item: 'ITEM',
      },
    });
    const { container } = render(<Hits {...props} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="ais-Hits ROOT MyCustomHits"
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
    const props = createProps({
      hits: [{ objectID: 'abc', __position: 1, custom: 'value' }],
      itemComponent: jest.fn(() => <li></li>),
    });
    render(<Hits {...props} />);

    test('receives hit', () => {
      expect(props.itemComponent).toHaveBeenLastCalledWith(
        expect.objectContaining({ hit: props.hits[0] }),
        {}
      );
    });

    test('receives className', () => {
      expect(props.itemComponent).toHaveBeenLastCalledWith(
        expect.objectContaining({ className: 'ais-Hits-item' }),
        {}
      );
    });

    test('receives event handlers', () => {
      expect(props.itemComponent).toHaveBeenLastCalledWith(
        expect.objectContaining({
          onClick: expect.any(Function),
          onAuxClick: expect.any(Function),
        }),
        {}
      );
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
