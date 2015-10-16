/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import headerFooter from '../headerFooter';
import Template from '../../components/Template';

import toEqualJSX from 'expect-to-equal-jsx';
expect.extend({toEqualJSX});

describe('headerFooter', () => {
  var renderer;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
  });

  it('should render headerFooter(<div />)', () => {
    var out = render({cssClasses: {root: 'wrapper'}});
    expect(out).toEqualJSX(
      <div className="wrapper">
        <Template data={{}} templateKey="header" transformData={null} />
        <div cssClasses={{root: 'wrapper'}} />
        <Template data={{}} templateKey="footer" transformData={null} />
      </div>
    );
  });

  function render(props = {}) {
    var HeaderFooter = headerFooter(<div />);
    renderer.render(<HeaderFooter {...props} />);
    return renderer.getRenderOutput();
  }
});

