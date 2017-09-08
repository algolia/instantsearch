import React from 'react';
import sinon from 'sinon';
import expect from 'expect';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);
import algoliasearchHelper from 'algoliasearch-helper';
import infiniteHits from '../infinite-hits';
import InfiniteHits from '../../../components/InfiniteHits';
import defaultTemplates from '../defaultTemplates.js';

describe('infiniteHits call', () => {
  it('throws an exception when no container', () => {
    expect(infiniteHits).toThrow();
  });
});

describe('infiniteHits()', () => {
  let ReactDOM;
  let container;
  let templateProps;
  let widget;
  let results;
  let props;
  let helper;

  beforeEach(() => {
    helper = algoliasearchHelper({ addAlgoliaAgent: () => {} });
    helper.search = sinon.spy();

    ReactDOM = { render: sinon.spy() };
    infiniteHits.__Rewire__('ReactDOM', ReactDOM);

    container = document.createElement('div');
    templateProps = {
      transformData: undefined,
      templatesConfig: undefined,
      templates: defaultTemplates,
      useCustomCompileOptions: { item: false, empty: false },
    };
    widget = infiniteHits({
      container,
      escapeHits: true,
      cssClasses: { root: ['root', 'cx'] },
    });
    widget.init({ helper, instantSearchInstance: {} });
    results = { hits: [{ first: 'hit', second: 'hit' }] };
  });

  it('It does have a specific configuration', () => {
    expect(widget.getConfiguration()).toEqual({
      highlightPostTag: '__/ais-highlight__',
      highlightPreTag: '__ais-highlight__',
    });
  });

  it('calls twice ReactDOM.render(<Hits props />, container)', () => {
    props = getProps();
    const state = { page: 0 };
    widget.render({ results, state });
    widget.render({ results, state });

    expect(ReactDOM.render.calledTwice).toBe(
      true,
      'ReactDOM.render called twice'
    );
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(
      <InfiniteHits {...props} />
    );
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
    expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(
      <InfiniteHits {...props} />
    );
    expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  it('if it is the last page, then the props should contain isLastPage true', () => {
    props = getProps();
    const state = { page: 0 };
    widget.render({
      results: { ...results, page: 0, nbPages: 2 },
      state,
    });
    widget.render({
      results: { ...results, page: 1, nbPages: 2 },
      state,
    });

    expect(ReactDOM.render.calledTwice).toBe(
      true,
      'ReactDOM.render called twice'
    );
    const propsWithIsLastPageFalse = {
      ...getProps({ ...results, page: 0, nbPages: 2 }),
      isLastPage: false,
    };
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(
      <InfiniteHits {...propsWithIsLastPageFalse} />
    );
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
    const propsWithIsLastPageTrue = {
      ...getProps({ ...results, page: 1, nbPages: 2 }),
      isLastPage: true,
    };
    expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(
      <InfiniteHits {...propsWithIsLastPageTrue} />
    );
    expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  it('does not accept both item and allItems templates', () => {
    expect(
      infiniteHits.bind({ container, templates: { item: '', allItems: '' } })
    ).toThrow();
  });

  it('updates the search state properly when showMore is called', () => {
    expect(helper.state.page).toBe(0);

    widget.showMore();

    expect(helper.state.page).toBe(1);
    expect(helper.search.callCount).toBe(1);
  });

  afterEach(() => {
    infiniteHits.__ResetDependency__('ReactDOM');
    infiniteHits.__ResetDependency__('defaultTemplates');
  });

  function getProps(otherResults) {
    return {
      hits: (otherResults || results).hits,
      results: otherResults || results,
      templateProps,
      cssClasses: {
        root: 'ais-infinite-hits root cx',
        item: 'ais-infinite-hits--item',
        empty: 'ais-infinite-hits__empty',
        showmore: 'ais-infinite-hits--showmore',
      },
      showMore: () => {},
      showMoreLabel: 'Show more results',
      isLastPage: false,
    };
  }
});
