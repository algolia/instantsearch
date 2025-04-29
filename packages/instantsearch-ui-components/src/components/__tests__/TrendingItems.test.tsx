/**
 * @jest-environment jsdom
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { createElement, Fragment } from 'preact';

import { createTrendingItemsComponent } from '../TrendingItems';

import type { RecordWithObjectID } from '../../types';
import type { TrendingItemsProps } from '../TrendingItems';

const TrendingItems = createTrendingItemsComponent({
  createElement,
  Fragment,
});

const ItemComponent: TrendingItemsProps<RecordWithObjectID>['itemComponent'] =
  ({ item }) => <div>{item.objectID}</div>;

describe('TrendingItems', () => {
  test('renders items with default layout and header', () => {
    const { container } = render(
      <TrendingItems
        status="idle"
        items={[
          {
            objectID: '1',
            __position: 1,
          },
          {
            objectID: '2',
            __position: 2,
          },
        ]}
        itemComponent={ItemComponent}
        sendEvent={jest.fn()}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section
          class="ais-TrendingItems"
        >
          <h3
            class="ais-TrendingItems-title"
          >
            Trending items
          </h3>
          <div
            class="ais-TrendingItems-container"
          >
            <ol
              class="ais-TrendingItems-list"
            >
              <li
                class="ais-TrendingItems-item"
              >
                <div>
                  1
                </div>
              </li>
              <li
                class="ais-TrendingItems-item"
              >
                <div>
                  2
                </div>
              </li>
            </ol>
          </div>
        </section>
      </div>
    `);
  });

  test('renders default empty component', () => {
    const { container } = render(
      <TrendingItems
        status="idle"
        items={[]}
        itemComponent={ItemComponent}
        sendEvent={jest.fn()}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section
          class="ais-TrendingItems ais-TrendingItems--empty"
        >
          No results
        </section>
      </div>
    `);
  });

  test('renders custom header', () => {
    const { container } = render(
      <TrendingItems
        status="idle"
        items={[{ objectID: '1', __position: 1 }]}
        headerComponent={({ classNames }) => (
          <div className={classNames.title}>My custom header</div>
        )}
        itemComponent={ItemComponent}
        sendEvent={jest.fn()}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section
          class="ais-TrendingItems"
        >
          <div
            class="ais-TrendingItems-title"
          >
            My custom header
          </div>
          <div
            class="ais-TrendingItems-container"
          >
            <ol
              class="ais-TrendingItems-list"
            >
              <li
                class="ais-TrendingItems-item"
              >
                <div>
                  1
                </div>
              </li>
            </ol>
          </div>
        </section>
      </div>
    `);
  });

  test('renders custom layout', () => {
    const { container } = render(
      <TrendingItems
        status="idle"
        items={[{ objectID: '1', __position: 1 }]}
        itemComponent={ItemComponent}
        layout={(props) => (
          <div className={props.classNames.container}>
            <ol className={props.classNames.list}>
              {props.items.map((item) => (
                <li key={item.objectID} className={props.classNames.item}>
                  <props.itemComponent
                    item={item}
                    onClick={jest.fn()}
                    onAuxClick={jest.fn()}
                    sendEvent={jest.fn()}
                  />
                </li>
              ))}
            </ol>
          </div>
        )}
        sendEvent={jest.fn()}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section
          class="ais-TrendingItems"
        >
          <h3
            class="ais-TrendingItems-title"
          >
            Trending items
          </h3>
          <div
            class="ais-TrendingItems-container"
          >
            <ol
              class="ais-TrendingItems-list"
            >
              <li
                class="ais-TrendingItems-item"
              >
                <div>
                  1
                </div>
              </li>
            </ol>
          </div>
        </section>
      </div>
    `);
  });

  test('renders custom empty component', () => {
    const { container } = render(
      <TrendingItems
        status="idle"
        items={[]}
        emptyComponent={() => <Fragment>My custom empty component</Fragment>}
        itemComponent={ItemComponent}
        sendEvent={jest.fn()}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section
          class="ais-TrendingItems ais-TrendingItems--empty"
        >
          My custom empty component
        </section>
      </div>
    `);
  });

  test('sends a `click` event when clicking on an item', () => {
    const sendEvent = jest.fn();
    const items = [{ objectID: '1', __position: 1 }];

    const { container } = render(
      <TrendingItems
        status="idle"
        items={items}
        itemComponent={ItemComponent}
        sendEvent={sendEvent}
      />
    );

    userEvent.click(container.querySelectorAll('.ais-TrendingItems-item')[0]!);

    expect(sendEvent).toHaveBeenCalledTimes(1);
    expect(sendEvent).toHaveBeenNthCalledWith(
      1,
      'click:internal',
      items[0],
      'Item Clicked'
    );
  });

  test('accepts custom title translation', () => {
    const { container } = render(
      <TrendingItems
        status="idle"
        items={[{ objectID: '1', __position: 1 }]}
        translations={{ title: 'My custom title' }}
        itemComponent={ItemComponent}
        sendEvent={jest.fn()}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section
          class="ais-TrendingItems"
        >
          <h3
            class="ais-TrendingItems-title"
          >
            My custom title
          </h3>
          <div
            class="ais-TrendingItems-container"
          >
            <ol
              class="ais-TrendingItems-list"
            >
              <li
                class="ais-TrendingItems-item"
              >
                <div>
                  1
                </div>
              </li>
            </ol>
          </div>
        </section>
      </div>
    `);
  });

  test('forwards `div` props to the root element', () => {
    const { container } = render(
      <TrendingItems
        status="idle"
        items={[{ objectID: '1', __position: 1 }]}
        hidden={true}
        itemComponent={ItemComponent}
        sendEvent={jest.fn()}
      />
    );

    expect(
      container.querySelector<HTMLDivElement>('.ais-TrendingItems')!.hidden
    ).toBe(true);
  });

  test('accepts custom class names', () => {
    const { container } = render(
      <TrendingItems
        status="idle"
        items={[{ objectID: '1', __position: 1 }]}
        classNames={{
          root: 'ROOT',
          title: 'TITLE',
          container: 'CONTAINER',
          list: 'LIST',
          item: 'ITEM',
        }}
        itemComponent={ItemComponent}
        sendEvent={jest.fn()}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section
          class="ais-TrendingItems ROOT"
        >
          <h3
            class="ais-TrendingItems-title TITLE"
          >
            Trending items
          </h3>
          <div
            class="ais-TrendingItems-container CONTAINER"
          >
            <ol
              class="ais-TrendingItems-list LIST"
            >
              <li
                class="ais-TrendingItems-item ITEM"
              >
                <div>
                  1
                </div>
              </li>
            </ol>
          </div>
        </section>
      </div>
    `);
  });
});
