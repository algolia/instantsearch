/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import algoliasearchHelper from 'algoliasearch-helper';
import infiniteHits from '../infinite-hits';
import InfiniteHits from '../../../components/InfiniteHits';

describe('infiniteHits call', () => {
  it('throws an exception when no container', () => {
    expect(infiniteHits).toThrow(/^Must provide a container/);
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
  const defaultTemplates = {
    hit: 'hit',
    empty: 'empty',
  };

  beforeEach(() => {
    helper = algoliasearchHelper({addAlgoliaAgent: () => {}});
    helper.search = sinon.spy();

    ReactDOM = {render: sinon.spy()};
    infiniteHits.__Rewire__('ReactDOM', ReactDOM);
    infiniteHits.__Rewire__('defaultTemplates', defaultTemplates);

    container = document.createElement('div');
    templateProps = {
      transformData: undefined,
      templatesConfig: undefined,
      templates: defaultTemplates,
      useCustomCompileOptions: {hit: false, empty: false},
    };
    widget = infiniteHits({container, cssClasses: {root: ['root', 'cx']}});
    widget.init({helper});
    results = {hits: [{first: 'hit', second: 'hit'}]};
  });

  it('configures hitsPerPage', () => {
    expect(widget.getConfiguration()).toEqual({hitsPerPage: 20});
  });

  it('calls twice ReactDOM.render(<Hits props />, container)', () => {
    props = getProps();
    const state = {page: 0};
    widget.render({results, state});
    widget.render({results, state});

    expect(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<InfiniteHits {...props} />);
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
    expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(<InfiniteHits {...props} />);
    expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  it('does not accept both item and allItems templates', () => {
    expect(infiniteHits.bind({container, templates: {item: '', allItems: ''}})).toThrow();
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

  function getProps() {
    return {
      hits: results.hits,
      results,
      templateProps,
      cssClasses: {
        root: 'ais-infinitehits root cx',
        item: 'ais-infinitehits--item',
        empty: 'ais-infinitehits__empty',
        showmore: 'ais-infinitehits--showmore',
      },
      showMore: () => {},
      showMoreLabel: 'Show more results',
    };
  }
});
