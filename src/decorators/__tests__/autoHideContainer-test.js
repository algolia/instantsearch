/* eslint-env mocha */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import TestComponent from './TestComponent';
import autoHideContainer from '../autoHideContainer';

import sinon from 'sinon';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('autoHideContainer', () => {
  let props = {};

  it('should render autoHideContainer(<TestComponent />)', () => {
    const {createRenderer} = TestUtils;
    const renderer = createRenderer();
    props.hello = 'son';
    let AutoHide = autoHideContainer(TestComponent);
    renderer.render(<AutoHide {...props} />);
    const out = renderer.getRenderOutput();
    expect(out).toEqualJSX(<TestComponent hello="son" />);
  });

  context('props.shouldAutoHideContainer', () => {
    let AutoHide;
    let component;
    let container;

    beforeEach(() => {
      AutoHide = autoHideContainer(TestComponent);
      container = document.createElement('div');
      props = {hello: 'mom'};
      component = ReactDOM.render(<AutoHide {...props} />, container);
    });

    it('creates a component', () => expect(component).toExist());

    it('shows the container at first', () => {
      expect(container.style.display).toNotEqual('none');
    });

    context('when set to true', () => {
      beforeEach(() => {
        sinon.spy(component, 'render');
        props.shouldAutoHideContainer = true;
        ReactDOM.render(<AutoHide {...props} />, container);
      });

      it('hides the container', () => {
        expect(container.style.display).toEqual('none');
      });

      it('does not call component.render()', () => {
        expect(component.render.called).toBe(false);
      });

      context('when set back to false', () => {
        beforeEach(() => {
          props.shouldAutoHideContainer = false;
          ReactDOM.render(<AutoHide {...props} />, container);
        });

        it('shows the container', () => {
          expect(container.style.display).toNotEqual('none');
        });

        it('calls component.render()', () => {
          expect(component.render.calledOnce).toBe(true);
        });
      });
    });
  });
});
