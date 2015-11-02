/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import TestUtils from 'react-addons-test-utils';
import Pagination from '../Pagination';
import PaginationLink from '../PaginationLink';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

let bem = require('../../../lib/utils').bemHelper('ais-pagination');
let cx = require('classnames');

describe('Pagination', () => {
  let renderer;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
  });

  it('should not display the first/last link by default', () => {
    let out = render();

    expect(out.props.children.length).toEqual(5);
    expect(out.props.children[0]).toEqual(null);
    expect(out.props.children[4]).toEqual(null);
  });

  it('should display the first/last link', () => {
    let out = render({showFirstLast: true});

    expect(out.props.children.length).toEqual(5);
    expect(out.props.children[0]).toNotEqual(null);
    expect(out.props.children[4]).toNotEqual(null);
  });

  it('should display the right number of pages', () => {
    let padding = 4;
    let out = render({padding});

    expect(out.props.children.length).toEqual(5);
    expect(out.props.children[2].length).toEqual(padding + 1 + padding);
  });

  it('should flag the current page as active', () => {
    let out = render({currentPage: 0});

    expect(out.props.children.length).toEqual(5);
    expect(out.props.children[2][0].props.className)
      .toEqual(cx(bem('item-page', 'active'), bem('item'), bem('item-page')));
    expect(out.props.children[2][1].props.className)
      .toEqual(cx(bem('item'), bem('item-page')));
  });

  it('should disable the first page if already on it', () => {
    let out = render({currentPage: 0, showFirstLast: true});

    expect(out.props.children.length).toEqual(5);
    expect(out.props.children[0].props.className)
      .toEqual(cx(bem('item', 'disabled'), bem('item'), bem('item-first')));
  });

  it('should build the associated URL', () => {
    let createURL = sinon.stub().returns('/page');
    let out = new Pagination({cssClasses: {}}).pageLink({
      label: 'test',
      createURL
    });

    expect(out).toEqualJSX(
      <PaginationLink
        ariaLabel={undefined}
        className="ais-pagination--item"
        handleClick={() => {}}
        key="test"
        label="test"
        url="/page"
      />);
    expect(createURL.calledOnce).toBe(true, 'createURL should be called once');
  });

  it('should not build the URL of disabled page', () => {
    let createURL = sinon.spy();
    let out = new Pagination({cssClasses: {}}).pageLink({
      label: 'test',
      isDisabled: true,
      createURL
    });

    expect(out).toEqualJSX(
      <PaginationLink
        ariaLabel={undefined}
        className="ais-pagination--item__disabled ais-pagination--item"
        handleClick={() => {}}
        key="test"
        label="test"
        url="#"
      />);
    expect(createURL.called).toBe(false, 'createURL should not be called');
  });

  it('should disable last first page if already on it', () => {
    let out = render({currentPage: 19, showFirstLast: true});

    expect(out.props.children.length).toEqual(5);
    expect(out.props.children[4].props.className)
      .toEqual(cx(bem('item', 'disabled'), bem('item'), bem('item-last')));
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
      cssClasses: {},
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
