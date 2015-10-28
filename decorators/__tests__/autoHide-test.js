/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import TestComponent from './TestComponent';
import autoHideContainer from '../autoHideContainer';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('autoHideContainer', () => {
  var renderer;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
  });

  it('should render autoHideContainer(<TestComponent />)', () => {
    var out = render();
    expect(out).toEqualJSX(<TestComponent />);
  });

  it('should not render autoHideContainer(<TestComponent />)', () => {
    var out = render({hasResults: false, hideContainerWhenNoResults: true});
    expect(out).toEqualJSX(<div />);
  });

  function render(props = {}) {
    var AutoHide = autoHideContainer(TestComponent);
    renderer.render(<AutoHide {...props} />);
    return renderer.getRenderOutput();
  }
});

