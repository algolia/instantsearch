/**
 * @jest-environment jsdom
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { createElement, Fragment } from 'preact';

import { createRelatedProductsComponent } from '../RelatedProducts';

import type { RecordWithObjectID } from '../../types';
import type { RelatedProductsProps } from '../RelatedProducts';

const RelatedProducts = createRelatedProductsComponent({
  createElement,
  Fragment,
});

const ItemComponent: RelatedProductsProps<RecordWithObjectID>['itemComponent'] =
  ({ item }) => <div>{item.objectID}</div>;

describe('RelatedProducts', () => {
  test('renders items with default layout and header', () => {
    const { container } = render(
      <RelatedProducts
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
          class="ais-RelatedProducts"
        >
          <h3
            class="ais-RelatedProducts-title"
          >
            Related products
          </h3>
          <div
            class="ais-RelatedProducts-container"
          >
            <ol
              class="ais-RelatedProducts-list"
            >
              <li
                class="ais-RelatedProducts-item"
              >
                <div>
                  1
                </div>
              </li>
              <li
                class="ais-RelatedProducts-item"
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
      <RelatedProducts
        status="idle"
        items={[]}
        itemComponent={ItemComponent}
        sendEvent={jest.fn()}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section
          class="ais-RelatedProducts ais-RelatedProducts--empty"
        >
          No results
        </section>
      </div>
    `);
  });

  test('renders custom header', () => {
    const { container } = render(
      <RelatedProducts
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
          class="ais-RelatedProducts"
        >
          <div
            class="ais-RelatedProducts-title"
          >
            My custom header
          </div>
          <div
            class="ais-RelatedProducts-container"
          >
            <ol
              class="ais-RelatedProducts-list"
            >
              <li
                class="ais-RelatedProducts-item"
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
      <RelatedProducts
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
          class="ais-RelatedProducts"
        >
          <h3
            class="ais-RelatedProducts-title"
          >
            Related products
          </h3>
          <div
            class="ais-RelatedProducts-container"
          >
            <ol
              class="ais-RelatedProducts-list"
            >
              <li
                class="ais-RelatedProducts-item"
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
      <RelatedProducts
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
          class="ais-RelatedProducts ais-RelatedProducts--empty"
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
      <RelatedProducts
        status="idle"
        items={items}
        itemComponent={ItemComponent}
        sendEvent={sendEvent}
      />
    );

    userEvent.click(
      container.querySelectorAll('.ais-RelatedProducts-item')[0]!
    );

    expect(sendEvent).toHaveBeenCalledTimes(1);
  });

  test('accepts custom title translation', () => {
    const { container } = render(
      <RelatedProducts
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
          class="ais-RelatedProducts"
        >
          <h3
            class="ais-RelatedProducts-title"
          >
            My custom title
          </h3>
          <div
            class="ais-RelatedProducts-container"
          >
            <ol
              class="ais-RelatedProducts-list"
            >
              <li
                class="ais-RelatedProducts-item"
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
      <RelatedProducts
        status="idle"
        items={[{ objectID: '1', __position: 1 }]}
        hidden={true}
        itemComponent={ItemComponent}
        sendEvent={jest.fn()}
      />
    );

    expect(
      container.querySelector<HTMLDivElement>('.ais-RelatedProducts')!.hidden
    ).toBe(true);
  });

  test('accepts custom class names', () => {
    const { container } = render(
      <RelatedProducts
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
          class="ais-RelatedProducts ROOT"
        >
          <h3
            class="ais-RelatedProducts-title TITLE"
          >
            Related products
          </h3>
          <div
            class="ais-RelatedProducts-container CONTAINER"
          >
            <ol
              class="ais-RelatedProducts-list LIST"
            >
              <li
                class="ais-RelatedProducts-item ITEM"
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
