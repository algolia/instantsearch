/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import TestComponent from './TestComponent';
import autoHideContainer from '../autoHideContainer';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('autoHideContainer', () => {
  let renderer;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
  });

  it('should render autoHideContainer(<TestComponent />)', () => {
    let out = render();
    expect(out).toEqualJSX(<TestComponent />);
  });

  it('should not render autoHideContainer(<TestComponent />)', () => {
    let out = render({shouldAutoHideContainer: true});
    expect(out).toEqualJSX(<div />);
  });

  function render(props = {}) {
    let AutoHide = autoHideContainer(TestComponent);
    renderer.render(<AutoHide {...props} />);
    return renderer.getRenderOutput();
  }
});

