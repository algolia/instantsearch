/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import autoHideContainer from '../autoHideContainer';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('autoHideContainer', () => {
  var renderer;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
  });

  it('should render autoHideContainer(<span />)', () => {
    var out = render();
    expect(out).toEqualJSX(<span />);
  });

  it('should not render autoHideContainer(<span />)', () => {
    var out = render({hasResults: false, hideContainerWhenNoResults: true});
    expect(out).toEqualJSX(<div />);
  });

  function render(props = {}) {
    var AutoHide = autoHideContainer(<span />);
    renderer.render(<AutoHide {...props} />);
    return renderer.getRenderOutput();
  }
});

