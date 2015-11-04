/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

import hits from '../hits';
import Hits from '../../../components/Hits';

describe('hits()', () => {
  jsdom({useEach: true});

  let ReactDOM;
  let container;
  let templateProps;
  let widget;
  let results;
  let props;
  let defaultTemplates = {
    hit: 'hit',
    empty: 'empty'
  };

  beforeEach(() => {
    ReactDOM = {render: sinon.spy()};
    hits.__Rewire__('ReactDOM', ReactDOM);
    hits.__Rewire__('defaultTemplates', defaultTemplates);

    container = document.createElement('div');
    templateProps = {
      transformData: undefined,
      templatesConfig: undefined,
      templates: defaultTemplates,
      useCustomCompileOptions: {hit: false, empty: false}
    };
    widget = hits({container});
    results = {hits: [{first: 'hit', second: 'hit'}]};
  });

  it('configures hitsPerPage', () => {
    expect(widget.getConfiguration()).toEqual({hitsPerPage: 20});
  });

  it('calls twice ReactDOM.render(<Hits props />, container)', () => {
    props = getProps();
    widget.render({results});
    widget.render({results});

    expect(ReactDOM.render.calledTwice).toBe(true, 'ReactDOM.render called twice');
    expect(ReactDOM.render.firstCall.args[0]).toEqualJSX(<Hits {...props} />);
    expect(ReactDOM.render.firstCall.args[1]).toEqual(container);
    expect(ReactDOM.render.secondCall.args[0]).toEqualJSX(<Hits {...props} />);
    expect(ReactDOM.render.secondCall.args[1]).toEqual(container);
  });

  afterEach(() => {
    hits.__ResetDependency__('ReactDOM');
    hits.__ResetDependency__('defaultTemplates');
  });

  function getProps() {
    return {
      hits: results.hits,
      results,
      templateProps,
      cssClasses: {
        root: 'ais-hits',
        item: 'ais-hits--item',
        empty: 'ais-hits__empty'
      }
    };
  }
});
