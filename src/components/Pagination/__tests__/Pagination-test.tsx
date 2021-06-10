/** @jsx h */

import { h } from 'preact';
import { mount } from 'enzyme';
import Pagination, { PaginationProps } from '../Pagination';
import Paginator from '../../../connectors/pagination/Paginator';
import { ReactElementLike } from 'prop-types';

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
    createURL: args => JSON.stringify(args),
    templates: { first: '', last: '', next: '', previous: '' },
    currentPage: 0,
    pages: pager.pages(),
    isFirstPage: pager.isFirstPage(),
    isLastPage: pager.isLastPage(),
    nbPages: 20,
    setCurrentPage: () => {},
  };

  it('should render five elements', () => {
    const wrapper = mount(
      (<Pagination {...defaultProps} />) as ReactElementLike
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('should display the first/last link', () => {
    const wrapper = mount(
      (<Pagination {...defaultProps} showFirst showLast />) as ReactElementLike
    );

    expect(wrapper.find('.firstPageItem')).toHaveLength(1);
    expect(wrapper.find('.lastPageItem')).toHaveLength(1);
    expect(wrapper).toMatchSnapshot();
  });

  it('should add the noRefinement CSS class with a single page', () => {
    const wrapper = mount(
      (<Pagination {...defaultProps} nbPages={1} />) as ReactElementLike
    );

    expect(wrapper.find('.noRefinementRoot')).toHaveLength(1);
    expect(wrapper).toMatchSnapshot();
  });

  it('should disable last page if already on it', () => {
    const wrapper = mount(
      (
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
      ) as ReactElementLike
    );

    expect(wrapper.find('.lastPageItem').hasClass('disabledItem')).toBe(true);
    expect(wrapper).toMatchSnapshot();
  });

  it('should handle special clicks', () => {
    const props = {
      setCurrentPage: jest.fn(),
    };
    const preventDefault = jest.fn();
    const component = new Pagination({ ...defaultProps, ...props });
    ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'].forEach(e => {
      const event = { preventDefault };
      event[e] = true;
      // @ts-expect-error
      component.handleClick(42, event);

      expect(props.setCurrentPage).toHaveBeenCalledTimes(0);
      expect(preventDefault).toHaveBeenCalledTimes(0);
    });
    // @ts-expect-error
    component.handleClick(42, { preventDefault });

    expect(props.setCurrentPage).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('should have all buttons disabled if there are no results', () => {
    const localPager = new Paginator({
      currentPage: 0,
      total: 0,
      padding: 3,
    });
    const wrapper = mount(
      (
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
      ) as ReactElementLike
    );

    expect(wrapper).toMatchSnapshot();
  });
});
