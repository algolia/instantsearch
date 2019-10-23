/** @jsx h */

import { h } from 'preact';
import { mount } from 'enzyme';
import Pagination from '../Pagination';
import Paginator from '../../../connectors/pagination/Paginator';

describe('Pagination', () => {
  const pager = new Paginator({
    currentPage: 0,
    total: 20,
    padding: 3,
  });
  const defaultProps = {
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
    createURL: (...args) => JSON.stringify(args),
    templates: { first: '', last: '', next: '', previous: '' },
    currentPage: 0,
    nbHits: 200,
    pages: pager.pages(),
    isFirstPage: pager.isFirstPage(),
    isLastPage: pager.isLastPage(),
    nbPages: 20,
    padding: 3,
    setCurrentPage: () => {},
  };

  it('should render five elements', () => {
    const wrapper = mount(<Pagination {...defaultProps} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('should display the first/last link', () => {
    const wrapper = mount(<Pagination {...defaultProps} showFirst showLast />);

    expect(wrapper.find('.firstPageItem')).toHaveLength(1);
    expect(wrapper.find('.lastPageItem')).toHaveLength(1);
    expect(wrapper).toMatchSnapshot();
  });

  it('should add the noRefinement CSS class with a single page', () => {
    const wrapper = mount(<Pagination {...defaultProps} nbPages={1} />);

    expect(wrapper.find('.noRefinementRoot')).toHaveLength(1);
    expect(wrapper).toMatchSnapshot();
  });

  it('should disable last page if already on it', () => {
    const wrapper = mount(
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

    expect(wrapper.find('.lastPageItem').hasClass('disabledItem')).toBe(true);
    expect(wrapper).toMatchSnapshot();
  });

  it('should handle special clicks', () => {
    const props = {
      setCurrentPage: jest.fn(),
    };
    const preventDefault = jest.fn();
    const component = new Pagination(props);
    ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'].forEach(e => {
      const event = { preventDefault };
      event[e] = true;
      component.handleClick(42, event);

      expect(props.setCurrentPage).toHaveBeenCalledTimes(0);
      expect(preventDefault).toHaveBeenCalledTimes(0);
    });
    component.handleClick(42, { preventDefault });

    expect(props.setCurrentPage).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('should have all buttons disabled if there are no results', () => {
    const wrapper = mount(
      <Pagination
        {...defaultProps}
        showFirst
        showLast
        showPrevious
        showNext
        currentPage={0}
        nbHits={0}
        nbPages={0}
        pages={[0]}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
