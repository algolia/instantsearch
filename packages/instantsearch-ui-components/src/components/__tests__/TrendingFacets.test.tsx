/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import { createElement, Fragment } from 'preact';

import { createTrendingFacetsComponent } from '../TrendingFacets';

import type { TrendingFacetItem } from '../TrendingFacets';

const TrendingFacets = createTrendingFacetsComponent({
  createElement,
  Fragment,
});

const items: TrendingFacetItem[] = [
  { facetName: 'brand', facetValue: 'Apple', _score: 95 },
  { facetName: 'brand', facetValue: 'Samsung', _score: 87 },
];

describe('TrendingFacets', () => {
  test('renders items with default layout and header', () => {
    const { container } = render(
      <TrendingFacets status="idle" items={items} />
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <section
          class="ais-TrendingFacets"
        >
          <h3
            class="ais-TrendingFacets-title"
          >
            Trending
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
                Apple
              </li>
              <li
                class="ais-TrendingFacets-item"
              >
                Samsung
              </li>
            </ol>
          </div>
        </section>
      </div>
    `);
  });

  test('renders default empty component', () => {
    const { container } = render(
      <TrendingFacets status="idle" items={[]} />
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
        items={[items[0]]}
        headerComponent={({ classNames }) => (
          <div className={classNames.title}>My custom header</div>
        )}
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
                Apple
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

  test('accepts custom title translation', () => {
    const { container } = render(
      <TrendingFacets
        status="idle"
        items={[items[0]]}
        translations={{ title: 'My custom title' }}
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
                Apple
              </li>
            </ol>
          </div>
        </section>
      </div>
    `);
  });

  test('forwards `div` props to the root element', () => {
    const { container } = render(
      <TrendingFacets status="idle" items={[items[0]]} hidden={true} />
    );

    expect(
      container.querySelector<HTMLDivElement>('.ais-TrendingFacets')!.hidden
    ).toBe(true);
  });

  test('accepts custom class names', () => {
    const { container } = render(
      <TrendingFacets
        status="idle"
        items={[items[0]]}
        classNames={{
          root: 'ROOT',
          title: 'TITLE',
          container: 'CONTAINER',
          list: 'LIST',
          item: 'ITEM',
        }}
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
            Trending
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
                Apple
              </li>
            </ol>
          </div>
        </section>
      </div>
    `);
  });

  test('renders custom item component', () => {
    const { container } = render(
      <TrendingFacets
        status="idle"
        items={items}
        itemComponent={({ item }) => (
          <div>
            {item.facetValue} ({item._score})
          </div>
        )}
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
            Trending
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
                  Apple
                   (
                  95
                  )
                </div>
              </li>
              <li
                class="ais-TrendingFacets-item"
              >
                <div>
                  Samsung
                   (
                  87
                  )
                </div>
              </li>
            </ol>
          </div>
        </section>
      </div>
    `);
  });
});
