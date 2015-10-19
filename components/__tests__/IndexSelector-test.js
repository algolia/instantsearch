/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import IndexSelector from '../IndexSelector';

describe('IndexSelector', () => {
  var renderer;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
  });


  it('should render <IndexSelector/>', () => {
    var out = render({
      currentIndex: 'index-a',
      cssClasses: {
        root: 'custom-root',
        item: 'custom-item'
      }
    });
    expect(out).toEqualJSX(
      <select
        className="custom-root"
        onChange={() => {}}
        value="index-a"
      >
        <option className="custom-item" value="index-a">Index A</option>
        <option className="custom-item" value="index-b">Index B</option>
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
