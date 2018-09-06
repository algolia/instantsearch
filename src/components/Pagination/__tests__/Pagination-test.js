import React from 'react';
import sinon from 'sinon';
import Pagination from '../Pagination';
import Paginator from '../../../connectors/pagination/Paginator';
import renderer from 'react-test-renderer';

describe('Pagination', () => {
  const pager = new Paginator({
    currentPage: 0,
    total: 20,
    padding: 3,
  });
  const defaultProps = {
    cssClasses: {
      root: 'root',
      noRefinement: 'noRefinement',
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
    labels: { first: '', last: '', next: '', previous: '' },
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
    const tree = renderer.create(<Pagination {...defaultProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should display the first/last link', () => {
    const tree = renderer
      .create(<Pagination {...defaultProps} showFirst showLast />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should disable last page if already on it', () => {
    const tree = renderer
      .create(
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
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should handle special clicks', () => {
    const props = {
      setCurrentPage: sinon.spy(),
    };
    const preventDefault = sinon.spy();
    const component = new Pagination(props);
    ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'].forEach(e => {
      const event = { preventDefault };
      event[e] = true;
      component.handleClick(42, event);
      expect(props.setCurrentPage.called).toBe(
        false,
        'setCurrentPage never called'
      );
      expect(preventDefault.called).toBe(false, 'preventDefault never called');
    });
    component.handleClick(42, { preventDefault });
    expect(props.setCurrentPage.calledOnce).toBe(
      true,
      'setCurrentPage called once'
    );
    expect(preventDefault.calledOnce).toBe(true, 'preventDefault called once');
  });

  it('should have all buttons disabled if there are no results', () => {
    const tree = renderer
      .create(
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
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
