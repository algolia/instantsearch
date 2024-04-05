/**
 * @jest-environment jsdom
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import { createElement, Fragment } from 'preact';

import { createFrequentlyBoughtTogetherComponent } from '../FrequentlyBoughtTogether';

const FrequentlyBoughtTogether = createFrequentlyBoughtTogetherComponent({
  createElement,
  Fragment,
});

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
        itemComponent={({ item }) => (
          <div>
            {item.objectID}-{item.title}
          </div>
        )}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section
          class="ais-Recommend"
        >
          <h3
            class="ais-Recommend-title"
          >
            Frequently bought together
          </h3>
          <div
            class="ais-Recommend-container"
          >
            <ol
              class="ais-Recommend-list"
            >
              <li
                class="ais-Recommend-item"
              >
                <div>
                  1
                  -
                  item 1
                </div>
              </li>
              <li
                class="ais-Recommend-item"
              >
                <div>
                  2
                  -
                  item 2
                </div>
              </li>
            </ol>
          </div>
        </section>
      </div>
    `);
  });

  test('renders default fallback component', () => {
    const { container } = render(
      <FrequentlyBoughtTogether
        status="idle"
        items={[]}
        itemComponent={() => <div />}
      />
    );

    expect(container).toMatchInlineSnapshot(`<div />`);
  });

  test('renders custom fallback component', () => {
    const { container } = render(
      <FrequentlyBoughtTogether
        status="idle"
        items={[]}
        fallbackComponent={() => <div>My custom fallback</div>}
        itemComponent={() => <div />}
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

  test('renders custom header component', () => {
    const { container } = render(
      <FrequentlyBoughtTogether
        status="idle"
        items={[{ objectID: '1' }]}
        headerComponent={() => <div>My custom header</div>}
        itemComponent={({ item }) => <Fragment>{item.objectID}</Fragment>}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section
          class="ais-Recommend"
        >
          <div>
            My custom header
          </div>
          <div
            class="ais-Recommend-container"
          >
            <ol
              class="ais-Recommend-list"
            >
              <li
                class="ais-Recommend-item"
              >
                1
              </li>
            </ol>
          </div>
        </section>
      </div>
    `);
  });

  test('renders custom title translation', () => {
    const { container } = render(
      <FrequentlyBoughtTogether
        status="idle"
        items={[{ objectID: '1' }]}
        translations={{
          title: 'My custom title',
        }}
        itemComponent={() => <div />}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section
          class="ais-Recommend"
        >
          <h3
            class="ais-Recommend-title"
          >
            My custom title
          </h3>
          <div
            class="ais-Recommend-container"
          >
            <ol
              class="ais-Recommend-list"
            >
              <li
                class="ais-Recommend-item"
              >
                <div />
              </li>
            </ol>
          </div>
        </section>
      </div>
    `);
  });

  test('renders with curtom class names', () => {
    const { container } = render(
      <FrequentlyBoughtTogether
        status="idle"
        items={[{ objectID: '1' }]}
        classNames={{
          root: 'custom-root-class',
          title: 'custom-title-class',
          container: 'custom-container-class',
          list: 'custom-list-class',
          item: 'custom-item-class',
        }}
        itemComponent={({ item }) => <div>{item.objectID}</div>}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section
          class="ais-Recommend custom-root-class"
        >
          <h3
            class="ais-Recommend-title custom-title-class"
          >
            Frequently bought together
          </h3>
          <div
            class="ais-Recommend-container custom-container-class"
          >
            <ol
              class="ais-Recommend-list custom-list-class"
            >
              <li
                class="ais-Recommend-item custom-item-class"
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
