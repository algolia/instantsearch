/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';

import hits from '../hits';
import Hits from '../../../components/Hits';

describe('hits()', () => {
  var ReactDOM;
  var container;
  var templateProps;
  var widget;
  var results;
  var props;
  var defaultTemplates = {
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
      useCustomCompileOptions: {empty: false, hit: false}
    };
    widget = hits({container});
    results = {hits: [{first: 'hit', second: 'hit'}]};
  });

  it('configures hitsPerPage', () => {
    expect(widget.getConfiguration()).toEqual({hitsPerPage: 20});
  });

  it('calls ReactDOM.render(<Hits props />, container)', () => {
    props = getProps();
    widget.render({results});

    expect(ReactDOM.render.calledOnce).toBe(true, 'ReactDOM.render called once');
    expect(ReactDOM.render.firstCall.args).toEqual([
      <Hits {...props} />,
      container
    ]);
  });

  afterEach(() => {
    hits.__ResetDependency__('ReactDOM');
    hits.__ResetDependency__('defaultTemplates');
  });

  function getProps() {
    return {hits: results.hits, results, templateProps};
  }
});
