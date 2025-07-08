/**
 * @jest-environment jsdom
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { createElement, Fragment } from 'preact';

import { createTrendingFacetsComponent } from '../TrendingFacets';

import type { TrendingFacetsProps } from '../TrendingFacets';

const TrendingFacets = createTrendingFacetsComponent({
  createElement,
  Fragment,
});

const ItemComponent: TrendingFacetsProps['itemComponent'] = ({ item }) => (
  <div>{item.objectID}</div>
);

describe('TrendingFacets', () => {
  test('renders items with default layout and header', () => {
    const { container } = render(
      <TrendingFacets
        status="idle"
        items={[
          {
            objectID: 'category:electronics',
            _score: 1,
            attribute: 'category',
            value: 'electronics',
            __position: 1,
          },
          {
            objectID: 'category:books',
            _score: 2,
            attribute: 'category',
            value: 'books',
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
          class="ais-TrendingFacets"
        >
          <h3
            class="ais-TrendingFacets-title"
          >
            Trending facets
          </h3>
          <div
            class="ais-TrendingFacets-container"
          >
            <ol
              class="ais-TrendingFacets-list"
            >
              <li
                class="ais-TrendingFacets-item"
              >
                <div>
                  category:electronics
                </div>
              </li>
              <li
                class="ais-TrendingFacets-item"
              >
                <div>
                  category:books
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
      <TrendingFacets
        status="idle"
        items={[]}
        itemComponent={ItemComponent}
        sendEvent={jest.fn()}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section
          class="ais-TrendingFacets ais-TrendingFacets--empty"
        >
          No results
        </section>
      </div>
    `);
  });

  test('renders custom header', () => {
    const { container } = render(
      <TrendingFacets
        status="idle"
        items={[
          {
            objectID: '1:1',
            _score: 1,
            attribute: '1',
            value: '1',
            __position: 1,
          },
        ]}
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
          class="ais-TrendingFacets"
        >
          <div
            class="ais-TrendingFacets-title"
          >
            My custom header
          </div>
          <div
            class="ais-TrendingFacets-container"
          >
            <ol
              class="ais-TrendingFacets-list"
            >
              <li
                class="ais-TrendingFacets-item"
              >
                <div>
                  1:1
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
      <TrendingFacets
        status="idle"
        items={[
          {
            objectID: '1:1',
            _score: 1,
            attribute: '1',
            value: '1',
            __position: 1,
          },
        ]}
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
          class="ais-TrendingFacets"
        >
          <h3
            class="ais-TrendingFacets-title"
          >
            Trending facets
          </h3>
          <div
            class="ais-TrendingFacets-container"
          >
            <ol
              class="ais-TrendingFacets-list"
            >
              <li
                class="ais-TrendingFacets-item"
              >
                <div>
                  1:1
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
      <TrendingFacets
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
          class="ais-TrendingFacets ais-TrendingFacets--empty"
        >
          My custom empty component
        </section>
      </div>
    `);
  });

  test('sends a `click` event when clicking on an item', () => {
    const sendEvent = jest.fn();
    const items = [
      { objectID: '1:1', _score: 1, attribute: '1', value: '1', __position: 1 },
    ];

    const { container } = render(
      <TrendingFacets
        status="idle"
        items={items}
        itemComponent={ItemComponent}
        sendEvent={sendEvent}
      />
    );

    userEvent.click(container.querySelectorAll('.ais-TrendingFacets-item')[0]!);

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
      <TrendingFacets
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
          class="ais-TrendingFacets"
        >
          <h3
            class="ais-TrendingFacets-title"
          >
            My custom title
          </h3>
          <div
            class="ais-TrendingFacets-container"
          >
            <ol
              class="ais-TrendingFacets-list"
            >
              <li
                class="ais-TrendingFacets-item"
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
      <TrendingFacets
        status="idle"
        items={[{ objectID: '1', __position: 1 }]}
        hidden={true}
        itemComponent={ItemComponent}
        sendEvent={jest.fn()}
      />
    );

    expect(
      container.querySelector<HTMLDivElement>('.ais-TrendingFacets')!.hidden
    ).toBe(true);
  });

  test('accepts custom class names', () => {
    const { container } = render(
      <TrendingFacets
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
          class="ais-TrendingFacets ROOT"
        >
          <h3
            class="ais-TrendingFacets-title TITLE"
          >
            Trending facets
          </h3>
          <div
            class="ais-TrendingFacets-container CONTAINER"
          >
            <ol
              class="ais-TrendingFacets-list LIST"
            >
              <li
                class="ais-TrendingFacets-item ITEM"
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
