/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { cx } from '@algolia/ui-components-shared';
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import userEvent from '@testing-library/user-event';
import { h } from 'preact';

import instantsearch from '../../../index.es';
import { history } from '../../../lib/routers';
import ratingMenu from '../rating-menu';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('ratingMenu', () => {
  test('has correct URLs', async () => {
    const container = document.createElement('div');
    const router = history();
    const searchClient = createSearchClient({
      search: jest.fn((requests) =>
        Promise.resolve(
          createMultiSearchResponse(
            ...requests.map((request) =>
              createSingleSearchResponse({
                index: request.indexName,
                facets: { price: { 1: 42, 2: 104, 3: 127, 4: 189, 5: 212 } },
              })
            )
          )
        )
      ),
    });

    const search = instantsearch({
      indexName: 'indexName',
      searchClient,
      routing: {
        router,
      },
    });

    search.addWidgets([
      ratingMenu({
        container,
        attribute: 'price',
      }),
    ]);

    search.start();
    await wait(0);

    const [link4, link3, link2, link1] = [...container.querySelectorAll('a')];
    expect(link4).toHaveAttribute(
      'href',
      router.createURL({ indexName: { ratingMenu: { price: 4 } } })
    );
    expect(link3).toHaveAttribute(
      'href',
      router.createURL({ indexName: { ratingMenu: { price: 3 } } })
    );
    expect(link2).toHaveAttribute(
      'href',
      router.createURL({ indexName: { ratingMenu: { price: 2 } } })
    );
    expect(link1).toHaveAttribute(
      'href',
      router.createURL({ indexName: { ratingMenu: { price: 1 } } })
    );

    userEvent.click(link4);
    await wait(0);

    expect(container.querySelector('a:first-of-type')).toHaveAttribute(
      'href',
      router.createURL({})
    );
  });

  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([ratingMenu({ container, attribute: 'price' })]);

      // @MAJOR Once Hogan.js and string-based templates are removed,
      // `search.start()` can be moved to the test body and the following
      // assertion can go away.
      expect(async () => {
        search.start();

        await wait(0);
      }).not.toWarnDev();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-RatingMenu"
  >
    <svg
      style="display: none;"
    >
      <symbol
        id="ais-RatingMenu-starSymbol"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 .288l2.833 8.718h9.167l-7.417 5.389 2.833 8.718-7.416-5.388-7.417 5.388 2.833-8.718-7.416-5.389h9.167z"
        />
      </symbol>
      <symbol
        id="ais-RatingMenu-starEmptySymbol"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"
        />
      </symbol>
    </svg>
    <ul
      class="ais-RatingMenu-list"
    >
      <li
        class="ais-RatingMenu-item"
      >
        <div>
          <a
            aria-label="4 & up"
            class="ais-RatingMenu-link"
            href="#"
          >
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starSymbol"
              />
            </svg>
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starSymbol"
              />
            </svg>
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starSymbol"
              />
            </svg>
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starSymbol"
              />
            </svg>
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starEmptySymbol"
              />
            </svg>
            <span
              class="ais-RatingMenu-label"
            >
              & Up
            </span>
            <span
              class="ais-RatingMenu-count"
            >
              401
            </span>
          </a>
        </div>
      </li>
      <li
        class="ais-RatingMenu-item"
      >
        <div>
          <a
            aria-label="3 & up"
            class="ais-RatingMenu-link"
            href="#"
          >
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starSymbol"
              />
            </svg>
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starSymbol"
              />
            </svg>
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starSymbol"
              />
            </svg>
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starEmptySymbol"
              />
            </svg>
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starEmptySymbol"
              />
            </svg>
            <span
              class="ais-RatingMenu-label"
            >
              & Up
            </span>
            <span
              class="ais-RatingMenu-count"
            >
              528
            </span>
          </a>
        </div>
      </li>
      <li
        class="ais-RatingMenu-item"
      >
        <div>
          <a
            aria-label="2 & up"
            class="ais-RatingMenu-link"
            href="#"
          >
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starSymbol"
              />
            </svg>
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starSymbol"
              />
            </svg>
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starEmptySymbol"
              />
            </svg>
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starEmptySymbol"
              />
            </svg>
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starEmptySymbol"
              />
            </svg>
            <span
              class="ais-RatingMenu-label"
            >
              & Up
            </span>
            <span
              class="ais-RatingMenu-count"
            >
              632
            </span>
          </a>
        </div>
      </li>
      <li
        class="ais-RatingMenu-item"
      >
        <div>
          <a
            aria-label="1 & up"
            class="ais-RatingMenu-link"
            href="#"
          >
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starSymbol"
              />
            </svg>
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starEmptySymbol"
              />
            </svg>
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starEmptySymbol"
              />
            </svg>
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starEmptySymbol"
              />
            </svg>
            <svg
              aria-hidden="true"
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
              height="24"
              width="24"
            >
              <use
                href="#ais-RatingMenu-starEmptySymbol"
              />
            </svg>
            <span
              class="ais-RatingMenu-label"
            >
              & Up
            </span>
            <span
              class="ais-RatingMenu-count"
            >
              674
            </span>
          </a>
        </div>
      </li>
    </ul>
  </div>
</div>
`);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        ratingMenu({
          container,
          attribute: 'price',
          templates: {
            item({ url, cssClasses, name, count, stars }, { html }) {
              return html`<a
                href="${url}"
                class="${cx(cssClasses.link)}"
                label="${`${name} and up`}"
              >
                ${stars.map(
                  (isFilled, index) =>
                    html`<svg
                      key="${index}"
                      class="${`${cx(cssClasses.starIcon)} ${
                        isFilled
                          ? cx(cssClasses.fullStarIcon)
                          : cx(cssClasses.emptyStarIcon)
                      }`}"
                    />`
                )}
                <span class="${cx(cssClasses.label)}">and up</span>
                <span class="${cx(cssClasses.count)}">${count}</span>
              </a>`;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-RatingMenu"
  >
    <svg
      style="display: none;"
    >
      <symbol
        id="ais-RatingMenu-starSymbol"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 .288l2.833 8.718h9.167l-7.417 5.389 2.833 8.718-7.416-5.388-7.417 5.388 2.833-8.718-7.416-5.389h9.167z"
        />
      </symbol>
      <symbol
        id="ais-RatingMenu-starEmptySymbol"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"
        />
      </symbol>
    </svg>
    <ul
      class="ais-RatingMenu-list"
    >
      <li
        class="ais-RatingMenu-item"
      >
        <div>
          <a
            class="ais-RatingMenu-link"
            href="#"
            label="4 and up"
          >
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <span
              class="ais-RatingMenu-label"
            >
              and up
            </span>
            <span
              class="ais-RatingMenu-count"
            >
              401
            </span>
          </a>
        </div>
      </li>
      <li
        class="ais-RatingMenu-item"
      >
        <div>
          <a
            class="ais-RatingMenu-link"
            href="#"
            label="3 and up"
          >
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <span
              class="ais-RatingMenu-label"
            >
              and up
            </span>
            <span
              class="ais-RatingMenu-count"
            >
              528
            </span>
          </a>
        </div>
      </li>
      <li
        class="ais-RatingMenu-item"
      >
        <div>
          <a
            class="ais-RatingMenu-link"
            href="#"
            label="2 and up"
          >
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <span
              class="ais-RatingMenu-label"
            >
              and up
            </span>
            <span
              class="ais-RatingMenu-count"
            >
              632
            </span>
          </a>
        </div>
      </li>
      <li
        class="ais-RatingMenu-item"
      >
        <div>
          <a
            class="ais-RatingMenu-link"
            href="#"
            label="1 and up"
          >
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <span
              class="ais-RatingMenu-label"
            >
              and up
            </span>
            <span
              class="ais-RatingMenu-count"
            >
              674
            </span>
          </a>
        </div>
      </li>
    </ul>
  </div>
</div>
`);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        ratingMenu({
          container,
          attribute: 'price',
          templates: {
            item({ url, cssClasses, name, count, stars }) {
              return (
                <a
                  href={url}
                  className={cx(cssClasses.link)}
                  label={`${name} and up`}
                >
                  {stars.map((isFilled, index) => (
                    <svg
                      key={index}
                      className={`${cx(cssClasses.starIcon)} ${
                        isFilled
                          ? cx(cssClasses.fullStarIcon)
                          : cx(cssClasses.emptyStarIcon)
                      }`}
                    />
                  ))}
                  <span className={cx(cssClasses.label)}>and up</span>
                  <span className={cx(cssClasses.count)}>{count}</span>
                </a>
              );
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-RatingMenu"
  >
    <svg
      style="display: none;"
    >
      <symbol
        id="ais-RatingMenu-starSymbol"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 .288l2.833 8.718h9.167l-7.417 5.389 2.833 8.718-7.416-5.388-7.417 5.388 2.833-8.718-7.416-5.389h9.167z"
        />
      </symbol>
      <symbol
        id="ais-RatingMenu-starEmptySymbol"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"
        />
      </symbol>
    </svg>
    <ul
      class="ais-RatingMenu-list"
    >
      <li
        class="ais-RatingMenu-item"
      >
        <div>
          <a
            class="ais-RatingMenu-link"
            href="#"
            label="4 and up"
          >
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <span
              class="ais-RatingMenu-label"
            >
              and up
            </span>
            <span
              class="ais-RatingMenu-count"
            >
              401
            </span>
          </a>
        </div>
      </li>
      <li
        class="ais-RatingMenu-item"
      >
        <div>
          <a
            class="ais-RatingMenu-link"
            href="#"
            label="3 and up"
          >
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <span
              class="ais-RatingMenu-label"
            >
              and up
            </span>
            <span
              class="ais-RatingMenu-count"
            >
              528
            </span>
          </a>
        </div>
      </li>
      <li
        class="ais-RatingMenu-item"
      >
        <div>
          <a
            class="ais-RatingMenu-link"
            href="#"
            label="2 and up"
          >
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <span
              class="ais-RatingMenu-label"
            >
              and up
            </span>
            <span
              class="ais-RatingMenu-count"
            >
              632
            </span>
          </a>
        </div>
      </li>
      <li
        class="ais-RatingMenu-item"
      >
        <div>
          <a
            class="ais-RatingMenu-link"
            href="#"
            label="1 and up"
          >
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--full"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <svg
              class="ais-RatingMenu-starIcon ais-RatingMenu-starIcon--empty"
            />
            <span
              class="ais-RatingMenu-label"
            >
              and up
            </span>
            <span
              class="ais-RatingMenu-count"
            >
              674
            </span>
          </a>
        </div>
      </li>
    </ul>
  </div>
</div>
`);
    });

    function createMockedSearchClient() {
      return createSearchClient({
        search: jest.fn((requests) =>
          Promise.resolve(
            createMultiSearchResponse(
              ...requests.map((request) =>
                createSingleSearchResponse({
                  index: request.indexName,
                  facets: { price: { 1: 42, 2: 104, 3: 127, 4: 189, 5: 212 } },
                })
              )
            )
          )
        ),
      });
    }
  });
});
