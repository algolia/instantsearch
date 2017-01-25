/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';
import {mount} from 'enzyme';

import Pagination from './Pagination';

const REQ_PROPS = {
  createURL: () => '#',
  refine: () => null,
  canRefine: true,
};

const DEFAULT_PROPS = {
  ...REQ_PROPS,
  nbPages: 20,
  currentRefinement: 9,
};

describe('Pagination', () => {
  it('applies its default props', () => {
    const tree = renderer.create(
      <Pagination
        {...DEFAULT_PROPS}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('displays the correct padding of links', () => {
    let tree = renderer.create(
      <Pagination
        {...REQ_PROPS}
        pagesPadding={5}
        nbPages={20}
        currentRefinement={0}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();

    tree = renderer.create(
      <Pagination
        {...REQ_PROPS}
        pagesPadding={4}
        nbPages={20}
        currentRefinement={9}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();

    tree = renderer.create(
      <Pagination
        {...REQ_PROPS}
        pagesPadding={3}
        nbPages={20}
        currentRefinement={19}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();

    tree = renderer.create(
      <Pagination
        {...REQ_PROPS}
        pagesPadding={2}
        nbPages={5}
        currentRefinement={3}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('allows toggling display of the first page button on and off', () => {
    let tree = renderer.create(
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

  it('indicates when first button is relevant', () => {
    let tree = renderer.create(
      <Pagination
        {...DEFAULT_PROPS}
        showFirst
        currentRefinement={1}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();

    tree = renderer.create(
      <Pagination
        {...DEFAULT_PROPS}
        showLast
        currentRefinement={DEFAULT_PROPS.nbPages}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('allows toggling display of the last page button on and off', () => {
    let tree = renderer.create(
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
    let tree = renderer.create(
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
    let tree = renderer.create(
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
    let tree = renderer.create(
      <Pagination
        {...REQ_PROPS}
        maxPages={10}
        showLast
        nbPages={15}
        currentRefinement={9}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();

    tree = renderer.create(
      <Pagination
        {...REQ_PROPS}
        maxPages={10}
        showLast
        nbPages={9}
        currentRefinement={8}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('lets you customize its theme', () => {
    const tree = renderer.create(
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
        currentRefinement={8}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('lets you customize its translations', () => {
    const tree = renderer.create(
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
        currentRefinement={8}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('refines its value when clicking on a page link', () => {
    const refine = jest.fn();
    const wrapper = mount(
        <Pagination
          {...DEFAULT_PROPS}
          refine={refine}
          showLast
        />
      );
    wrapper
        .find('.ais-Pagination__itemLink')
        .filterWhere(e => e.text() === '8')
        .simulate('click');
    expect(refine.mock.calls.length).toBe(1);
    expect(refine.mock.calls[0][0]).toEqual(8);
    wrapper
        .find('.ais-Pagination__itemLink')
        .filterWhere(e => e.text() === '9')
        .simulate('click');
    expect(refine.mock.calls.length).toBe(2);
    const parameters = refine.mock.calls[1][0];
    expect(parameters.valueOf()).toBe(9);
    expect(parameters.isSamePage).toBe(true);
    wrapper
        .find('.ais-Pagination__itemPrevious')
        .find('.ais-Pagination__itemLink')
        .simulate('click');
    expect(refine.mock.calls.length).toBe(3);
    expect(refine.mock.calls[2][0]).toEqual(8);
    wrapper
        .find('.ais-Pagination__itemNext')
        .find('.ais-Pagination__itemLink')
        .simulate('click');
    expect(refine.mock.calls.length).toBe(4);
    expect(refine.mock.calls[3][0]).toEqual(10);
    wrapper
        .find('.ais-Pagination__itemFirst')
        .find('.ais-Pagination__itemLink')
        .simulate('click');
    expect(refine.mock.calls.length).toBe(5);
    expect(refine.mock.calls[4][0]).toEqual(1);
    wrapper
        .find('.ais-Pagination__itemLast')
        .find('.ais-Pagination__itemLink')
        .simulate('click');
    expect(refine.mock.calls.length).toBe(6);
    expect(refine.mock.calls[5][0]).toEqual(20);
  });

  it('ignores special clicks', () => {
    const refine = jest.fn();
    const wrapper = mount(
        <Pagination
          {...DEFAULT_PROPS}
          refine={refine}
        />
      );
    const el = wrapper
        .find('.ais-Pagination__itemLink')
        .filterWhere(e => e.text() === '8');
    el.simulate('click', {button: 1});
    el.simulate('click', {altKey: true});
    el.simulate('click', {ctrlKey: true});
    el.simulate('click', {metaKey: true});
    el.simulate('click', {shiftKey: true});
    expect(refine.mock.calls.length).toBe(0);
  });
  it('Should indicate when no more refinement', () => {
    const refine = jest.fn();
    const canRefine = jest.fn();
    const wrapper = mount(
      <Pagination
        {...DEFAULT_PROPS}
        refine={refine}
      canRefine={true}
    />,
      {
        context: {canRefine},
        childContextTypes: {canRefine: React.PropTypes.func},
      },
    );

    expect(canRefine.mock.calls.length).toBe(1);
    expect(canRefine.mock.calls[0][0]).toEqual(true);
    expect(wrapper.find('.ais-Pagination__noRefinement').length).toBe(0);

    wrapper.setProps({canRefine: false});

    expect(canRefine.mock.calls.length).toBe(2);
    expect(canRefine.mock.calls[1][0]).toEqual(false);
    expect(wrapper.find('.ais-Pagination__noRefinement').length).toBe(1);
  });
});
