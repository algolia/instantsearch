/* eslint-env jest, jasmine */

import React from 'react';
import {mount} from 'enzyme';
import renderer from 'react/lib/ReactTestRenderer';

import Pagination from './Pagination';
import PaginationLink from './PaginationLink';
jest.unmock('./Pagination');
jest.unmock('./utils');
jest.unmock('./PaginationLink');

const DEFAULT_PROPS = {nbPages: 20, page: 9};

let tree;

describe('Pagination', () => {
  it('refines its value when clicking on a page link', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <Pagination
        refine={refine}
        showLast
        {...DEFAULT_PROPS}
      />
    );
    wrapper
      .find(PaginationLink)
      // .filter({pageNumber: 7}) doesn't work for some reason
      .filterWhere(e => e.props().pageNumber === 7)
      .find('.Pagination__item__link')
      .simulate('click');
    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual(7);
    wrapper
      .find(PaginationLink)
      .filterWhere(e => e.props().pageNumber === 9)
      .find('.Pagination__item__link')
      .simulate('click');
    expect(refine.mock.calls.length).toBe(2);
    expect(refine.mock.calls[1][0]).toEqual(9);
    wrapper
      .find('.Pagination__item--previous')
      .find('.Pagination__item__link')
      .simulate('click');
    expect(refine.mock.calls.length).toBe(3);
    expect(refine.mock.calls[2][0]).toEqual(8);
    wrapper
      .find('.Pagination__item--next')
      .find('.Pagination__item__link')
      .simulate('click');
    expect(refine.mock.calls.length).toBe(4);
    expect(refine.mock.calls[3][0]).toEqual(10);
    wrapper
      .find('.Pagination__item--first')
      .find('.Pagination__item__link')
      .simulate('click');
    expect(refine.mock.calls.length).toBe(5);
    expect(refine.mock.calls[4][0]).toEqual(0);
    wrapper
      .find('.Pagination__item--last')
      .find('.Pagination__item__link')
      .simulate('click');
    expect(refine.mock.calls.length).toBe(6);
    expect(refine.mock.calls[5][0]).toEqual(19);
  });

  it('ignores special clicks', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <Pagination
        refine={refine}
        {...DEFAULT_PROPS}
      />
    );
    const el = wrapper
      .find(PaginationLink)
      .filterWhere(e => e.props().pageNumber === 7)
      .find('.Pagination__item__link');
    el.simulate('click', {button: 1});
    el.simulate('click', {altKey: true});
    el.simulate('click', {ctrlKey: true});
    el.simulate('click', {metaKey: true});
    el.simulate('click', {shiftKey: true});
    expect(refine.mock.calls.length).toBe(0);
  });

  it('applies its default props', () => {
    tree = renderer.create(
      <Pagination
        {...DEFAULT_PROPS}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('displays the correct padding of links', () => {
    tree = renderer.create(
      <Pagination
        pagesPadding={5}
        nbPages={20}
        page={0}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();

    // @TODO: use .update(nextElement) once it lands
    tree = renderer.create(
      <Pagination
        pagesPadding={4}
        nbPages={20}
        page={9}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();

    tree = renderer.create(
      <Pagination
        pagesPadding={3}
        nbPages={20}
        page={19}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();

    tree = renderer.create(
      <Pagination
        pagesPadding={2}
        nbPages={5}
        page={3}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('allows toggling display of the first page button on and off', () => {
    tree = renderer.create(
      <Pagination
        showFirst
        {...DEFAULT_PROPS}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();

    tree = renderer.create(
      <Pagination
        showFirst={false}
        {...DEFAULT_PROPS}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('allows toggling display of the last page button on and off', () => {
    tree = renderer.create(
      <Pagination
        showLast
        {...DEFAULT_PROPS}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();

    tree = renderer.create(
      <Pagination
        showLast={false}
        {...DEFAULT_PROPS}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('allows toggling display of the previous page button on and off', () => {
    tree = renderer.create(
      <Pagination
        showPrevious
        {...DEFAULT_PROPS}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();

    tree = renderer.create(
      <Pagination
        showPrevious={false}
        {...DEFAULT_PROPS}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('allows toggling display of the next page button on and off', () => {
    tree = renderer.create(
      <Pagination
        showNext
        {...DEFAULT_PROPS}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();

    tree = renderer.create(
      <Pagination
        showNext={false}
        {...DEFAULT_PROPS}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('lets you force a maximum of pages', () => {
    tree = renderer.create(
      <Pagination
        maxPages={10}
        showLast
        nbPages={15}
        page={9}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();

    tree = renderer.create(
      <Pagination
        maxPages={10}
        showLast
        nbPages={9}
        page={8}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('lets you customize its theme', () => {
    tree = renderer.create(
      <Pagination
        theme={{
          root: 'ROOT',
          item: 'ITEM',
          first: 'FIRST',
          last: 'LAST',
          previous: 'PREVIOUS',
          next: 'NEXT',
          page: 'PAGE',
          active: 'ACTIVE',
          disabled: 'DISABLED',
          link: 'LINK',
        }}
        showLast
        pagesPadding={4}
        nbPages={10}
        page={8}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('lets you customize its translations', () => {
    tree = renderer.create(
      <Pagination
        translations={{
          previous: 'PREVIOUS',
          next: 'NEXT',
          first: 'FIRST',
          last: 'LAST',
          page: page => `PAGE_${(page + 1).toString()}`,
          ariaPrevious: 'ARIA_PREVIOUS',
          ariaNext: 'ARIA_NEXT',
          ariaFirst: 'ARIA_FIRST',
          ariaLast: 'ARIA_LAST',
          ariaPage: page => `ARIA_PAGE_${(page + 1).toString()}`,
        }}
        showLast
        pagesPadding={4}
        nbPages={10}
        page={8}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
