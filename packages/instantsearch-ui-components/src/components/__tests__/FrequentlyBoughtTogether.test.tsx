/**
 * @jest-environment jsdom
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import { createElement, Fragment } from 'preact';

import { createFrequentlyBoughtTogether } from '../FrequentlyBoughtTogether';

const FrequentlyBoughtTogether = createFrequentlyBoughtTogether({
  createElement,
  Fragment,
});

describe('FrequentlyBoughtTogether', () => {
  test('renders items with default view', () => {
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
          class="auc-Recommend"
        >
          <h3
            class="auc-Recommend-title"
          >
            Frequently bought together
          </h3>
          <div
            class="auc-Recommend-container"
          >
            <ol
              class="auc-Recommend-list"
            >
              <li
                class="auc-Recommend-item"
              >
                <div>
                  1
                  -
                  item 1
                </div>
              </li>
              <li
                class="auc-Recommend-item"
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

  test('should render custom header component', () => {
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
          class="auc-Recommend"
        >
          <div>
            My custom header
          </div>
          <div
            class="auc-Recommend-container"
          >
            <ol
              class="auc-Recommend-list"
            >
              <li
                class="auc-Recommend-item"
              >
                1
              </li>
            </ol>
          </div>
        </section>
      </div>
    `);
  });

  test('should render custom title translation', () => {
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
          class="auc-Recommend"
        >
          <h3
            class="auc-Recommend-title"
          >
            My custom title
          </h3>
          <div
            class="auc-Recommend-container"
          >
            <ol
              class="auc-Recommend-list"
            >
              <li
                class="auc-Recommend-item"
              >
                <div />
              </li>
            </ol>
          </div>
        </section>
      </div>
    `);
  });

  test.only('should not render while loading', () => {
    const { container } = render(
      <FrequentlyBoughtTogether
        status="loading"
        items={[]}
        itemComponent={() => <div />}
      />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section
          class="auc-Recommend"
        >
          <div
            class="auc-Recommend-container"
          >
            <ol
              class="auc-Recommend-list"
            />
          </div>
        </section>
      </div>
    `);
  });
});
