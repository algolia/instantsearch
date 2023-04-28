/**
 * @jest-environment jsdom
 */
/** @jsx h */

import { render, fireEvent, createEvent } from '@testing-library/preact';
import { h } from 'preact';

import Paginator from '../../../connectors/pagination/Paginator';
import Pagination from '../Pagination';

import type { PaginationProps } from '../Pagination';

describe('Pagination', () => {
  const pager = new Paginator({
    currentPage: 0,
    total: 20,
    padding: 3,
  });
  const defaultProps: PaginationProps = {
    cssClasses: {
      root: 'root',
      noRefinementRoot: 'noRefinementRoot',
      list: 'list',
      item: 'item',
      firstPageItem: 'firstPageItem',
      lastPageItem: 'lastPageItem',
      previousPageItem: 'previousPageItem',
      nextPageItem: 'nextPageItem',
      pageItem: 'pageItem',
      selectedItem: 'selectedItem',
      disabledItem: 'disabledItem',
      link: 'link',
    },
    createURL: (args) => JSON.stringify(args),
    templates: {
      first: '',
      last: '',
      next: '',
      page: ({ page }) => `${page}`,
      previous: '',
    },
    currentPage: 0,
    pages: pager.pages(),
    isFirstPage: pager.isFirstPage(),
    isLastPage: pager.isLastPage(),
    nbPages: 20,
    setCurrentPage: () => {},
  };

  it('should render five elements', () => {
    const { container } = render(<Pagination {...defaultProps} />);

    expect(container).toMatchSnapshot();
  });

  it('should display the first/last link', () => {
    const { container } = render(
      <Pagination {...defaultProps} showFirst showLast />
    );

    expect(container.querySelectorAll('.firstPageItem')).toHaveLength(1);
    expect(container.querySelectorAll('.lastPageItem')).toHaveLength(1);
    expect(container).toMatchSnapshot();
  });

  it('should add the noRefinement CSS class with a single page', () => {
    const { container } = render(<Pagination {...defaultProps} nbPages={1} />);

    expect(container.querySelectorAll('.noRefinementRoot')).toHaveLength(1);
    expect(container).toMatchSnapshot();
  });

  it('should disable last page if already on it', () => {
    const { container } = render(
      <Pagination
        {...defaultProps}
        showFirst
        showLast
        showPrevious
        showNext
        pages={[13, 14, 15, 16, 17, 18, 19]}
        currentPage={19}
        isFirstPage={false}
        isLastPage={true}
      />
    );

    expect(container.querySelectorAll('.lastPageItem')).toHaveLength(1);
    expect(
      container
        .querySelector('.lastPageItem')
        ?.classList.contains('disabledItem')
    ).toBe(true);
    expect(container).toMatchSnapshot();
  });

  it('should handle special clicks', () => {
    const props = {
      setCurrentPage: jest.fn(),
    };

    const { container } = render(<Pagination {...defaultProps} {...props} />);

    const firstItem = container.querySelector('.link')!;

    const modifiers = ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'] as const;
    modifiers.forEach((modifier) => {
      const clickEvent = createEvent.click(firstItem, { [modifier]: true });
      fireEvent(firstItem, clickEvent);

      expect(props.setCurrentPage).toHaveBeenCalledTimes(0);
      expect(clickEvent.defaultPrevented).toBe(false);
    });

    const clickEvent = createEvent.click(firstItem);
    fireEvent(firstItem, clickEvent);

    expect(props.setCurrentPage).toHaveBeenCalledTimes(1);
    expect(clickEvent.defaultPrevented).toBe(true);
  });

  it('should have all buttons disabled if there are no results', () => {
    const localPager = new Paginator({
      currentPage: 0,
      total: 0,
      padding: 3,
    });
    const { container } = render(
      <Pagination
        {...defaultProps}
        showFirst
        showLast
        showPrevious
        showNext
        currentPage={0}
        nbPages={0}
        pages={localPager.pages()}
        isFirstPage={localPager.isFirstPage()}
        isLastPage={localPager.isLastPage()}
      />
    );

    expect(container).toMatchSnapshot();
  });
});
