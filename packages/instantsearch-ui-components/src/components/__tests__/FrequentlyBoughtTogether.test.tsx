/**
 * @jest-environment jsdom
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import { createElement, Fragment } from 'preact';

import { createFrequentlyBoughtTogetherComponent } from '../FrequentlyBoughtTogether';

import type { RecordWithObjectID } from '../../types';
import type { FrequentlyBoughtTogetherProps } from '../FrequentlyBoughtTogether';

const FrequentlyBoughtTogether = createFrequentlyBoughtTogetherComponent({
  createElement,
  Fragment,
});

const ItemComponent: FrequentlyBoughtTogetherProps<RecordWithObjectID>['itemComponent'] =
  ({ item, ...itemProps }) => (
    <li {...itemProps}>
      <div>{item.objectID}</div>
    </li>
  );

describe('FrequentlyBoughtTogether', () => {
  test('renders items with default view and header', () => {
    const { container } = render(
      <FrequentlyBoughtTogether
        status="idle"
        items={[
          {
            objectID: '1',
            title: 'item 1',
          },
          {
            objectID: '2',
            title: 'item 2',
          },
        ]}
        itemComponent={ItemComponent}
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

  test('renders default fallback', () => {
    const { container } = render(
      <FrequentlyBoughtTogether
        status="idle"
        items={[]}
        itemComponent={ItemComponent}
      />
    );

    expect(container).toMatchInlineSnapshot(`<div />`);
  });

  test('renders custom header', () => {
    const { container } = render(
      <FrequentlyBoughtTogether
        status="idle"
        items={[{ objectID: '1' }]}
        headerComponent={({ classNames }) => (
          <div className={classNames.title}>My custom header</div>
        )}
        itemComponent={ItemComponent}
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
        items={[{ objectID: '1' }]}
        itemComponent={ItemComponent}
        view={(props) => (
          <div className={props.classNames.container}>
            <ol className={props.classNames.list}>
              {props.items.map((item) => (
                <li key={item.objectID} className={props.classNames.item}>
                  <props.itemComponent item={item} />
                </li>
              ))}
            </ol>
          </div>
        )}
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
                <li>
                  <div>
                    1
                  </div>
                </li>
              </li>
            </ol>
          </div>
        </section>
      </div>
    `);
  });

  test('renders custom fallback', () => {
    const { container } = render(
      <FrequentlyBoughtTogether
        status="idle"
        items={[]}
        fallbackComponent={() => <div>My custom fallback</div>}
        itemComponent={ItemComponent}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          My custom fallback
        </div>
      </div>
    `);
  });

  test('accepts custom title translation', () => {
    const { container } = render(
      <FrequentlyBoughtTogether
        status="idle"
        items={[{ objectID: '1' }]}
        translations={{ title: 'My custom title' }}
        itemComponent={ItemComponent}
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
        items={[{ objectID: '1' }]}
        hidden={true}
        itemComponent={ItemComponent}
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
        items={[{ objectID: '1' }]}
        classNames={{
          root: 'ROOT',
          title: 'TITLE',
          container: 'CONTAINER',
          list: 'LIST',
          item: 'ITEM',
        }}
        itemComponent={ItemComponent}
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