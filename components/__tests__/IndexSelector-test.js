/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import IndexSelector from '../IndexSelector';

var bem = require('../../lib/utils').bemHelper('ais-index-selector');
var cx = require('classnames');

describe('IndexSelector', () => {
  var renderer;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
  });


  it('should render <IndexSelector/>', () => {
    var out = render({currentIndex: 'index-a'});
    expect(out).toEqualJSX(
      <select
        className={cx(bem('select'))}
        onChange={() => {}}
        value="index-a"
      >
        <option className={cx(bem('option'))} value="index-a">Index A</option>
        <option className={cx(bem('option'))} value="index-b">Index B</option>
      </select>
    );
  });

  function render(extraProps = {}) {
    var props = getProps(extraProps);
    renderer.render(<IndexSelector {...props} />);
    return renderer.getRenderOutput();
  }

  function getProps(extraProps = {}) {
    return {
      cssClasses: {},
      indices: [{name: 'index-a', label: 'Index A'}, {name: 'index-b', label: 'Index B'}],
      ...extraProps
    };
  }
});
