/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { Hits } from '../Hits';

import type { HitsProps } from '../Hits';
import type { Hit } from 'instantsearch.js';

describe('Hits', () => {
  function createProps<THit extends Hit = Hit>(
    props: Partial<HitsProps<THit>>
  ) {
    return {
      hits: [
        { objectID: 'abc', __position: 1 },
        { objectID: 'def', __position: 2 },
      ] as THit[],
      sendEvent: jest.fn(),
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
              <div
                style="word-break: break-all;"
              >
                {"objectID":"abc","__position":1}
                …
              </div>
            </li>
            <li
              class="ais-Hits-item"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"def","__position":2}
                …
              </div>
            </li>
          </ol>
        </div>
      </div>
    `);
  });

  test('renders with custom hitComponent', () => {
    const props = createProps({
      hits: [
        { objectID: 'abc', __position: 1, something: true },
        { objectID: 'def', __position: 2, something: false },
      ],
      hitComponent: ({ hit }) => (
        <strong>{`${hit.objectID} - ${hit.something}`}</strong>
      ),
    });

    const { container } = render(<Hits {...props} />);

    expect(container.querySelectorAll('strong')).toHaveLength(2);

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
              <strong>
                abc - true
              </strong>
            </li>
            <li
              class="ais-Hits-item"
            >
              <strong>
                def - false
              </strong>
            </li>
          </ol>
        </div>
      </div>
    `);
  });

  test('passes sendEvent to hitComponent', () => {
    const props = createProps({
      hitComponent: ({ hit, sendEvent }) => (
        <button onClick={() => sendEvent(hit)}>{hit.objectID}</button>
      ),
    });

    const { container } = render(<Hits {...props} />);

    userEvent.click(container.querySelector('button')!);

    expect(props.sendEvent).toHaveBeenCalledTimes(2);
    expect((props.sendEvent as jest.Mock).mock.calls[0][0]).toBe(props.hits[0]);
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
              <div
                style="word-break: break-all;"
              >
                {"objectID":"abc","__position":1}
                …
              </div>
            </li>
            <li
              class="ais-Hits-item ITEM"
            >
              <div
                style="word-break: break-all;"
              >
                {"objectID":"def","__position":2}
                …
              </div>
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

  test('renders with custom div props', () => {
    const props = createProps({ hidden: true });

    const { container } = render(<Hits {...props} />);

    expect(container.querySelector<HTMLDivElement>('.ais-Hits')!.hidden).toBe(
      true
    );
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
});
