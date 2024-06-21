/**
 * @jest-environment jsdom
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { createElement, Fragment } from 'preact';

import { createFrequentlyBoughtTogetherComponent } from '../FrequentlyBoughtTogether';

import type { RecordWithObjectID } from '../../types';
import type { FrequentlyBoughtTogetherProps } from '../FrequentlyBoughtTogether';

const FrequentlyBoughtTogether = createFrequentlyBoughtTogetherComponent({
  createElement,
  Fragment,
});

const ItemComponent: FrequentlyBoughtTogetherProps<RecordWithObjectID>['itemComponent'] =
  ({ item }) => <div>{item.objectID}</div>;

describe('FrequentlyBoughtTogether', () => {
  test('renders items with default view and header', () => {
    const { container } = render(
      <FrequentlyBoughtTogether
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
          class="ais-FrequentlyBoughtTogether"
        >
          <h3
            class="ais-FrequentlyBoughtTogether-title"
          >
            Frequently bought together
          </h3>
          <div
            class="ais-FrequentlyBoughtTogether-container"
          >
            <ol
              class="ais-FrequentlyBoughtTogether-list"
            >
              <li
                class="ais-FrequentlyBoughtTogether-item"
              >
                <div>
                  1
                </div>
              </li>
              <li
                class="ais-FrequentlyBoughtTogether-item"
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
      <FrequentlyBoughtTogether
        status="idle"
        items={[]}
        itemComponent={ItemComponent}
        sendEvent={jest.fn()}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section
          class="ais-FrequentlyBoughtTogether ais-FrequentlyBoughtTogether--empty"
        >
          No results
        </section>
      </div>
    `);
  });

  test('renders custom header', () => {
    const { container } = render(
      <FrequentlyBoughtTogether
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
          class="ais-FrequentlyBoughtTogether"
        >
          <div
            class="ais-FrequentlyBoughtTogether-title"
          >
            My custom header
          </div>
          <div
            class="ais-FrequentlyBoughtTogether-container"
          >
            <ol
              class="ais-FrequentlyBoughtTogether-list"
            >
              <li
                class="ais-FrequentlyBoughtTogether-item"
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

  test('renders custom view', () => {
    const { container } = render(
      <FrequentlyBoughtTogether
        status="idle"
        items={[{ objectID: '1', __position: 1 }]}
        itemComponent={ItemComponent}
        view={(props) => (
          <div className={props.classNames.container}>
            <ol className={props.classNames.list}>
              {props.items.map((item) => (
                <li key={item.objectID} className={props.classNames.item}>
                  <props.itemComponent
                    item={item}
                    onClick={jest.fn()}
                    onAuxClick={jest.fn()}
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
          class="ais-FrequentlyBoughtTogether"
        >
          <h3
            class="ais-FrequentlyBoughtTogether-title"
          >
            Frequently bought together
          </h3>
          <div
            class="ais-FrequentlyBoughtTogether-container"
          >
            <ol
              class="ais-FrequentlyBoughtTogether-list"
            >
              <li
                class="ais-FrequentlyBoughtTogether-item"
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
      <FrequentlyBoughtTogether
        status="idle"
        items={[]}
        emptyComponent={() => <div>My custom empty component</div>}
        itemComponent={ItemComponent}
        sendEvent={jest.fn()}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section
          class="ais-FrequentlyBoughtTogether ais-FrequentlyBoughtTogether--empty"
        >
          <div>
            My custom empty component
          </div>
        </section>
      </div>
    `);
  });

  test('sends a `click` event when clicking on an item', () => {
    const sendEvent = jest.fn();
    const items = [{ objectID: '1', __position: 1 }];

    const { container } = render(
      <FrequentlyBoughtTogether
        status="idle"
        items={items}
        itemComponent={ItemComponent}
        sendEvent={sendEvent}
      />
    );

    userEvent.click(
      container.querySelectorAll('.ais-FrequentlyBoughtTogether-item')[0]
    );

    expect(sendEvent).toHaveBeenCalledTimes(1);
  });

  test('accepts custom title translation', () => {
    const { container } = render(
      <FrequentlyBoughtTogether
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
          class="ais-FrequentlyBoughtTogether"
        >
          <h3
            class="ais-FrequentlyBoughtTogether-title"
          >
            My custom title
          </h3>
          <div
            class="ais-FrequentlyBoughtTogether-container"
          >
            <ol
              class="ais-FrequentlyBoughtTogether-list"
            >
              <li
                class="ais-FrequentlyBoughtTogether-item"
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
      <FrequentlyBoughtTogether
        status="idle"
        items={[{ objectID: '1', __position: 1 }]}
        hidden={true}
        itemComponent={ItemComponent}
        sendEvent={jest.fn()}
      />
    );

    expect(
      container.querySelector<HTMLDivElement>('.ais-FrequentlyBoughtTogether')!
        .hidden
    ).toBe(true);
  });

  test('accepts custom class names', () => {
    const { container } = render(
      <FrequentlyBoughtTogether
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
          class="ais-FrequentlyBoughtTogether ROOT"
        >
          <h3
            class="ais-FrequentlyBoughtTogether-title TITLE"
          >
            Frequently bought together
          </h3>
          <div
            class="ais-FrequentlyBoughtTogether-container CONTAINER"
          >
            <ol
              class="ais-FrequentlyBoughtTogether-list LIST"
            >
              <li
                class="ais-FrequentlyBoughtTogether-item ITEM"
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
