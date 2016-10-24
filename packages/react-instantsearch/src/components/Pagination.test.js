/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';

import Pagination from './Pagination';

const REQ_PROPS = {
  createURL: () => '#',
  refine: () => null,
};

const DEFAULT_PROPS = {
  ...REQ_PROPS,
  nbPages: 20,
  page: 9,
};

let tree;

describe('Pagination', () => {
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
        {...REQ_PROPS}
        pagesPadding={5}
        nbPages={20}
        page={0}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();

    // @TODO: use .update(nextElement) once it lands
    tree = renderer.create(
      <Pagination
        {...REQ_PROPS}
        pagesPadding={4}
        nbPages={20}
        page={9}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();

    tree = renderer.create(
      <Pagination
        {...REQ_PROPS}
        pagesPadding={3}
        nbPages={20}
        page={19}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();

    tree = renderer.create(
      <Pagination
        {...REQ_PROPS}
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
        {...REQ_PROPS}
        maxPages={10}
        showLast
        nbPages={15}
        page={9}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();

    tree = renderer.create(
      <Pagination
        {...REQ_PROPS}
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
        {...REQ_PROPS}
        theme={{
          root: 'ROOT',
          item: 'ITEM',
          itemFirst: 'FIRST',
          itemLast: 'LAST',
          itemPrevious: 'PREVIOUS',
          itemNext: 'NEXT',
          itemPage: 'PAGE',
          itemSelected: 'SELECTED',
          itemDisabled: 'DISABLED',
          itemLink: 'LINK',
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
        {...REQ_PROPS}
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
