import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import autoHideContainer from '../autoHideContainer';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);
import sinon from 'sinon';

class TestComponent extends React.Component {
  render() {
    return <div>{this.props.hello}</div>;
  }
}

TestComponent.propTypes = {
  hello: React.PropTypes.string,
};

describe('autoHideContainer', () => {
  let props = {};

  it('should render autoHideContainer(<TestComponent />)', () => {
    const {createRenderer} = TestUtils;
    const renderer = createRenderer();
    props.hello = 'son';
    const AutoHide = autoHideContainer(TestComponent);
    renderer.render(<AutoHide shouldAutoHideContainer {...props} />);
    const out = renderer.getRenderOutput();
    expect(out).toEqualJSX(<TestComponent shouldAutoHideContainer hello="son" />);
  });

  describe('props.shouldAutoHideContainer', () => {
    let AutoHide;
    let component;
    let container;

    beforeEach(() => {
      AutoHide = autoHideContainer(TestComponent);
      container = document.createElement('div');
      props = {hello: 'mom', shouldAutoHideContainer: false};
      component = ReactDOM.render(<AutoHide {...props} />, container);
    });

    it('creates a component', () => {
      expect(component).toExist();
    });

    it('shows the container at first', () => {
      expect(container.style.display).toNotEqual('none');
    });

    describe('when set to true', () => {
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

      describe('when set back to false', () => {
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
