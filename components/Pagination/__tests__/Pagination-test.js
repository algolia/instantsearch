/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import TestUtils from 'react-addons-test-utils';
import Pagination from '../Pagination';
import PaginationLink from '../PaginationLink';

var bem = require('../../../lib/utils').bemHelper('ais-pagination');
var cx = require('classnames');

describe('Pagination', () => {
  var renderer;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
  });

  it('should not display the first/last link by default', () => {
    var out = render();

    expect(out.props.children.length).toEqual(5);
    expect(out.props.children[0]).toEqual(null);
    expect(out.props.children[4]).toEqual(null);
  });

  it('should display the first/last link', () => {
    var out = render({showFirstLast: true});

    expect(out.props.children.length).toEqual(5);
    expect(out.props.children[0]).toNotEqual(null);
    expect(out.props.children[4]).toNotEqual(null);
  });

  it('should display the right number of pages', () => {
    var padding = 4;
    var out = render({padding});

    expect(out.props.children.length).toEqual(5);
    expect(out.props.children[2].length).toEqual(padding + 1 + padding);
  });

  it('should flag the current page as active', () => {
    var out = render({currentPage: 0});

    expect(out.props.children.length).toEqual(5);
    expect(out.props.children[2][0].props.className)
      .toEqual(cx(bem('item-page', 'active'), bem('item'), bem('item-page')));
    expect(out.props.children[2][1].props.className)
      .toEqual(cx(bem('item'), bem('item-page')));
  });

  it('should disable the first page if already on it', () => {
    var out = render({currentPage: 0, showFirstLast: true});

    expect(out.props.children.length).toEqual(5);
    expect(out.props.children[0].props.className)
      .toEqual(cx(bem('item', 'disabled'), bem('item'), bem('item-first')));
  });

  it('should build the associated URL', () => {
    var createURL = sinon.stub().returns('/page');
    var out = new Pagination({cssClasses: {}}).pageLink({
      label: 'test',
      createURL
    });

    expect(out).toEqualJSX(
      <PaginationLink
        ariaLabel={undefined}
        className="ais-pagination--item"
        handleClick={() => {}}
        label="test"
        url="/page"
      />);
    expect(createURL.calledOnce).toBe(true, 'createURL should be called once');
  });

  it('should not build the URL of disabled page', () => {
    var createURL = sinon.spy();
    var out = new Pagination({cssClasses: {}}).pageLink({
      label: 'test',
      isDisabled: true,
      createURL
    });

    expect(out).toEqualJSX(
      <PaginationLink
        ariaLabel={undefined}
        className="ais-pagination--item__disabled ais-pagination--item"
        handleClick={() => {}}
        label="test"
        url="#"
      />);
    expect(createURL.called).toBe(false, 'createURL should not be called');
  });

  it('should disable last first page if already on it', () => {
    var out = render({currentPage: 19, showFirstLast: true});

    expect(out.props.children.length).toEqual(5);
    expect(out.props.children[4].props.className)
      .toEqual(cx(bem('item', 'disabled'), bem('item'), bem('item-last')));
  });

  it('should handle special clicks', () => {
    var props = {
      setCurrentPage: sinon.spy()
    };
    var preventDefault = sinon.spy();
    var component = new Pagination(props);
    ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'].forEach((e) => {
      var event = {preventDefault};
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
    var props = {
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
