/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import headerFooter from '../headerFooter';
import Template from '../../components/Template';

var bemHeader = require('../../lib/utils').bemHelper('ais-header');
var bemFooter = require('../../lib/utils').bemHelper('ais-footer');
var cx = require('classnames');

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

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
        <div className={cx(bemHeader(null))}>
          <Template data={{}} templateKey="header" transformData={null} />
        </div>
        <div className={undefined}>
          <div cssClasses={{root: 'wrapper'}} />
        </div>
        <div className={cx(bemFooter(null))}>
          <Template data={{}} templateKey="footer" transformData={null} />
        </div>
      </div>
    );
  });

  function render(props = {}) {
    var HeaderFooter = headerFooter(<div />);
    renderer.render(<HeaderFooter {...props} />);
    return renderer.getRenderOutput();
  }
});

