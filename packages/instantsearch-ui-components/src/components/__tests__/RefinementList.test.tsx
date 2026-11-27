/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx createElement */
import { render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { Fragment, createElement } from 'preact';

import { createRefinementListComponent } from '../RefinementList';

import type { RefinementListProps } from '../RefinementList';

describe('RefinementList', () => {
  const RefinementList = createRefinementListComponent({
    createElement,
    Fragment,
  });

  function createProps(
    props: Partial<RefinementListProps> = {}
  ): RefinementListProps {
    return {
      items: [
        { value: 'Apple', label: 'Apple', count: 1234, isRefined: true },
        { value: 'Samsung', label: 'Samsung', count: 50, isRefined: false },
      ],
      onRefine: jest.fn(),
      ...props,
    };
  }

  test('renders the default markup', () => {
    const { container } = render(<RefinementList {...createProps()} />);

    expect(container.firstChild).toMatchInlineSnapshot(`
      <div
        class="ais-RefinementList"
      >
        <ul
          class="ais-RefinementList-list"
        >
          <li
            class="ais-RefinementList-item ais-RefinementList-item--selected"
          >
            <label
              class="ais-RefinementList-label"
            >
              <input
                class="ais-RefinementList-checkbox"
                type="checkbox"
                value="Apple"
              />
              <span
                class="ais-RefinementList-labelText"
              >
                Apple
              </span>
              <span
                class="ais-RefinementList-count"
              >
                1,234
              </span>
            </label>
          </li>
          <li
            class="ais-RefinementList-item"
          >
            <label
              class="ais-RefinementList-label"
            >
              <input
                class="ais-RefinementList-checkbox"
                type="checkbox"
                value="Samsung"
              />
              <span
                class="ais-RefinementList-labelText"
              >
                Samsung
              </span>
              <span
                class="ais-RefinementList-count"
              >
                50
              </span>
            </label>
          </li>
        </ul>
      </div>
    `);
    const inputs = container.querySelectorAll('input');
    expect(inputs[0].checked).toBe(true);
    expect(inputs[1].checked).toBe(false);
  });

  test('adds the noRefinement modifier without items', () => {
    const { container } = render(
      <RefinementList
        {...createProps({ items: [] })}
        classNames={{ noRefinementRoot: 'EMPTY' }}
      />
    );

    expect(container.firstChild).toHaveClass(
      'ais-RefinementList',
      'ais-RefinementList--noRefinement',
      'EMPTY'
    );
    expect(container.querySelector('.ais-RefinementList-list')).toBeNull();
  });

  test('calls onRefine when a checkbox changes', async () => {
    const props = createProps();
    const { container } = render(<RefinementList {...props} />);

    await userEvent.click(container.querySelectorAll('input')[1]);

    expect(props.onRefine).toHaveBeenCalledTimes(1);
    expect(props.onRefine).toHaveBeenCalledWith(props.items[1]);
  });

  test('highlights labels when items come from a search', () => {
    const { container } = render(
      <RefinementList
        {...createProps({
          isFromSearch: true,
          items: [
            {
              value: 'Apple',
              label: 'Apple',
              highlighted: '__ais-highlight__App__/ais-highlight__le',
              count: 1,
              isRefined: false,
            },
          ],
        })}
      />
    );

    expect(container.querySelector('.ais-RefinementList-labelText'))
      .toMatchInlineSnapshot(`
      <span
        class="ais-RefinementList-labelText"
      >
        <span
          class="ais-Highlight"
        >
          <mark
            class="ais-Highlight-highlighted"
          >
            App
          </mark>
          <span
            class="ais-Highlight-nonHighlighted"
          >
            le
          </span>
        </span>
      </span>
    `);
  });

  test('escapes labels and highlighted values', () => {
    const { container, rerender } = render(
      <RefinementList
        {...createProps({
          items: [
            {
              value: 'xss',
              label: 'Samsung"><iframe/onload=alert("xss")>',
              highlighted: '<b>Apple</b>',
              count: 1,
              isRefined: false,
            },
          ],
        })}
      />
    );

    expect(
      container.querySelector('.ais-RefinementList-labelText')!.innerHTML
    ).toBe('Samsung"&gt;&lt;iframe/onload=alert("xss")&gt;');

    rerender(
      <RefinementList
        {...createProps({
          isFromSearch: true,
          items: [
            {
              value: 'xss',
              label: 'Apple',
              highlighted: '<b>Apple</b>',
              count: 1,
              isRefined: false,
            },
          ],
        })}
      />
    );

    expect(
      container.querySelector('.ais-RefinementList-labelText')!.innerHTML
    ).toBe(
      '<span class="ais-Highlight"><span class="ais-Highlight-nonHighlighted">&lt;b&gt;Apple&lt;/b&gt;</span></span>'
    );
  });

  test('renders the search box in its wrapper', () => {
    const { container } = render(
      <RefinementList
        {...createProps()}
        classNames={{ searchBox: 'SEARCHBOX' }}
        searchBoxComponent={() => <input className="custom-search" />}
      />
    );

    const wrapper = container.querySelector('.ais-RefinementList-searchBox');
    expect(wrapper).toHaveClass('SEARCHBOX');
    expect(wrapper!.querySelector('.custom-search')).not.toBeNull();
  });

  test('renders no results instead of the list', () => {
    const { container, rerender } = render(
      <RefinementList {...createProps({ items: [], showNoResults: true })} />
    );

    expect(
      container.querySelector('.ais-RefinementList-noResults')
    ).toHaveTextContent('No results.');

    rerender(
      <RefinementList
        {...createProps({ items: [], showNoResults: true })}
        translations={{ noResultsText: 'Nothing' }}
      />
    );
    expect(
      container.querySelector('.ais-RefinementList-noResults')
    ).toHaveTextContent('Nothing');

    rerender(
      <RefinementList
        {...createProps({ items: [], showNoResults: true })}
        noResultsComponent={() => <strong>Custom</strong>}
      />
    );
    expect(
      container.querySelector('.ais-RefinementList-noResults strong')
    ).toHaveTextContent('Custom');
  });

  test('renders the show more button', async () => {
    const onToggleShowMore = jest.fn();
    const { container, rerender } = render(
      <RefinementList
        {...createProps()}
        showMore
        canToggleShowMore
        onToggleShowMore={onToggleShowMore}
        translations={{ showMoreButtonLabel: 'More brands' }}
      />
    );

    const button = container.querySelector('.ais-RefinementList-showMore')!;
    expect(button).toHaveTextContent('Show more');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-label', 'More brands');
    expect(button).not.toHaveClass('ais-RefinementList-showMore--disabled');

    await userEvent.click(button);
    expect(onToggleShowMore).toHaveBeenCalledTimes(1);

    rerender(
      <RefinementList
        {...createProps()}
        showMore
        isShowingMore
        canToggleShowMore={false}
        classNames={{ disabledShowMore: 'DISABLED' }}
        showMoreTextComponent={({ isShowingMore }) =>
          isShowingMore ? 'Fewer' : 'More'
        }
      />
    );
    expect(button).toHaveTextContent('Fewer');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toBeDisabled();
    expect(button).toHaveClass(
      'ais-RefinementList-showMore--disabled',
      'DISABLED'
    );
  });

  test('accepts an item component', () => {
    const { container } = render(
      <RefinementList
        {...createProps()}
        classNames={{ item: 'ITEM', selectedItem: 'SELECTED' }}
        itemComponent={({ item, className }) => (
          <li className={className} data-value={item.value}>
            {item.label}
          </li>
        )}
      />
    );

    const items = container.querySelectorAll('li');
    expect(items[0]).toHaveClass(
      'ais-RefinementList-item',
      'ITEM',
      'ais-RefinementList-item--selected',
      'SELECTED'
    );
    expect(items[1]).toHaveAttribute('data-value', 'Samsung');
    expect(items[1]).toHaveTextContent('Samsung');
  });

  test('forwards class names to each element', () => {
    const { container } = render(
      <RefinementList
        {...createProps()}
        className="EXTRA"
        classNames={{
          root: 'ROOT',
          list: 'LIST',
          label: 'LABEL',
          checkbox: 'CHECKBOX',
          labelText: 'LABELTEXT',
          count: 'COUNT',
        }}
      />
    );

    expect(container.firstChild).toHaveClass('ROOT', 'EXTRA');
    expect(container.querySelector('ul')).toHaveClass('LIST');
    expect(container.querySelector('label')).toHaveClass('LABEL');
    expect(container.querySelector('input')).toHaveClass('CHECKBOX');
    expect(
      container.querySelector('.ais-RefinementList-labelText')
    ).toHaveClass('LABELTEXT');
    expect(container.querySelector('.ais-RefinementList-count')).toHaveClass(
      'COUNT'
    );
  });
});
