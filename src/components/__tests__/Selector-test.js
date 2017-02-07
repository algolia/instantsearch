/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import {RawSelector as Selector} from '../Selector';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('Selector', () => {
  let renderer;

  beforeEach(() => {
    const {createRenderer} = TestUtils;
    renderer = createRenderer();
  });

  it('should render <Selector/> with strings', () => {
    const out = render({
      currentValue: 'index-a',
      cssClasses: {
        root: 'custom-root',
        item: 'custom-item',
      },
      options: [{value: 'index-a', label: 'Index A'}, {value: 'index-b', label: 'Index B'}],
    });
    expect(out).toEqualJSX(
      <select
        className="custom-root"
        value="index-a"
        onChange={() => {}}
      >
        <option className="custom-item" value="index-a">Index A</option>
        <option className="custom-item" value="index-b">Index B</option>
      </select>
    );
  });

  it('should render <Selector/> with numbers', () => {
    const out = render({
      currentValue: 10,
      cssClasses: {
        root: 'custom-root',
        item: 'custom-item',
      },
      options: [{value: 10, label: '10 results per page'}, {value: 20, label: '20 results per page'}],
    });
    expect(out).toEqualJSX(
      <select
        className="custom-root"
        value={10}
        onChange={() => {}}
      >
        <option className="custom-item" value={10}>10 results per page</option>
        <option className="custom-item" value={20}>20 results per page</option>
      </select>
    );
  });

  function render(props = {}) {
    renderer.render(<Selector {...props} />);
    return renderer.getRenderOutput();
  }
});
