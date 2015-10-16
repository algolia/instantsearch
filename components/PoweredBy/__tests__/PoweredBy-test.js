/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import PoweredBy from '../PoweredBy/PoweredBy';

import toEqualJSX from 'expect-to-equal-jsx';
expect.extend({toEqualJSX});

var bem = require('../../lib/utils').bemHelper('ais-powered-by');
var cx = require('classnames');

describe('PoweredBy', () => {
  var renderer;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
  });

  it('should render <PoweredBy className="pb" />', () => {
    var out = render({className: 'pb'});
    expect(out).toEqualJSX(
    <div className={cx('pb', bem(null))}>
      Powered by
      <a className={cx(bem('link'))} href="https://www.algolia.com/">
        <img className={cx(bem('image'))} src={'data:image/png;base64,' + require('../PoweredBy/algolia-logo').base64} />
      </a>
    </div>);
  });

  function render(extraProps = {}) {
    renderer.render(<PoweredBy {...getProps(extraProps)} />);
    return renderer.getRenderOutput();
  }

  function getProps(extraProps = {}) {
    return {
      cssClasses: {},
      ...extraProps
    };
  }
});
