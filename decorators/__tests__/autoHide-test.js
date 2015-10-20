/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import autoHide from '../autoHide';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('autoHide', () => {
  var renderer;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
  });

  it('should render autoHide(<span />)', () => {
    var out = render();
    expect(out).toEqualJSX(<span />);
  });

  it('should not render autoHide(<span />)', () => {
    var out = render({hasResults: false, hideWhenNoResults: true});
    expect(out).toEqualJSX(<div />);
  });

  function render(props = {}) {
    var AutoHide = autoHide(<span />);
    renderer.render(<AutoHide {...props} />);
    return renderer.getRenderOutput();
  }
});

