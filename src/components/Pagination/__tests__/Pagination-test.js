/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import TestUtils from 'react-addons-test-utils';
import Pagination from '../Pagination';
import PaginationLink from '../PaginationLink';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('Pagination', () => {
  let renderer;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
  });

  it('should render five elements', () => {
    let out = render();

    expect(out.props.children.length).toEqual(5);
  });

  it('should not display the first/last link by default', () => {
    let out = render();

    expect(out.props.children[0]).toEqual(null);
    expect(out.props.children[4]).toEqual(null);
  });

  it('should display the first/last link', () => {
    let out = render({showFirstLast: true});

    expect(out.props.children[0]).toNotEqual(null);
    expect(out.props.children[4]).toNotEqual(null);
  });

  it('should display the right number of pages', () => {
    let padding = 4;
    let out = render({padding});

    expect(out.props.children[2].length).toEqual(padding + 1 + padding);
  });

  it('should flag the current page as active', () => {
    let out = render({currentPage: 0});

    expect(out.props.children[2][0].props.cssClasses.item).toBe('item page active');
    expect(out.props.children[2][1].props.cssClasses.item).toBe('item page');
  });

  it('should disable the first page if already on it', () => {
    let out = render({currentPage: 0, showFirstLast: true});

    expect(out.props.children[0].props.cssClasses.item).toBe('item first disabled');
  });

  it('should build the associated URL', () => {
    let createURL = sinon.stub().returns('/page');
    let out = new Pagination({cssClasses: {}}).pageLink({
      label: 'test',
      pageNumber: 8,
      createURL
    });

    expect(out).toEqualJSX(
      <PaginationLink
        ariaLabel={undefined}
        cssClasses={{item: '', link: ''}}
        handleClick={() => {}}
        key="test8"
        label="test"
        pageNumber={8}
        url="/page"
      />);
    expect(createURL.calledOnce).toBe(true, 'createURL should be called once');
  });

  it('should not build the URL of disabled page', () => {
    let createURL = sinon.spy();
    let out = new Pagination({cssClasses: {}}).pageLink({
      label: 'test',
      isDisabled: true,
      pageNumber: 8,
      createURL
    });

    expect(out).toEqualJSX(
      <PaginationLink
        ariaLabel={undefined}
        cssClasses={{item: '', link: ''}}
        handleClick={() => {}}
        key="test8"
        label="test"
        pageNumber={8}
        url="#"
      />);
    expect(createURL.called).toBe(false, 'createURL should not be called');
  });

  it('should disable last page if already on it', () => {
    let out = render({currentPage: 19, showFirstLast: true});

    expect(out.props.children[4].props.cssClasses.item).toBe('item last disabled');
  });

  it('should handle special clicks', () => {
    let props = {
      setCurrentPage: sinon.spy()
    };
    let preventDefault = sinon.spy();
    let component = new Pagination(props);
    ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'].forEach((e) => {
      let event = {preventDefault};
      event[e] = true;
      component.handleClick(42, event);
      expect(props.setCurrentPage.called).toBe(false, 'setCurrentPage never called');
      expect(preventDefault.called).toBe(false, 'preventDefault never called');
    });
    component.handleClick(42, {preventDefault});
    expect(props.setCurrentPage.calledOnce).toBe(true, 'setCurrentPage called once');
    expect(preventDefault.calledOnce).toBe(true, 'preventDefault called once');
  });

  function render(extraProps = {}) {
    let props = {
      cssClasses: {
        root: 'root',
        item: 'item',
        page: 'page',
        previous: 'previous',
        next: 'next',
        first: 'first',
        last: 'last',
        active: 'active',
        disabled: 'disabled'
      },
      labels: {first: '', last: '', next: '', previous: ''},
      currentPage: 0,
      nbHits: 200,
      nbPages: 20,
      padding: 3,
      setCurrentPage: () => {},
      ...extraProps
    };

    renderer.render(<Pagination {...props} />);
    return renderer.getRenderOutput();
  }
});
