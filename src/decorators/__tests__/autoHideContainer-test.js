import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { createRenderer } from 'react-test-renderer/shallow';
import autoHideContainer from '../autoHideContainer';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);
import sinon from 'sinon';

class TestComponent extends React.Component {
  render() {
    return (
      <div>
        {this.props.hello}
      </div>
    );
  }
}

TestComponent.propTypes = {
  hello: PropTypes.string,
};

describe('autoHideContainer', () => {
  let props = {};

  it('should render autoHideContainer(<TestComponent />)', () => {
    const renderer = createRenderer();
    props.hello = 'son';
    const AutoHide = autoHideContainer(TestComponent);
    renderer.render(<AutoHide shouldAutoHideContainer {...props} />);
    const out = renderer.getRenderOutput();
    expect(out).toEqualJSX(
      <div style={{ display: 'none' }}>
        <TestComponent hello="son" shouldAutoHideContainer />
      </div>
    );
  });

  describe('props.shouldAutoHideContainer', () => {
    let AutoHide;
    let component;
    let container;
    let innerContainer;

    beforeEach(() => {
      AutoHide = autoHideContainer(TestComponent);
      container = document.createElement('div');
      props = { hello: 'mom', shouldAutoHideContainer: false };
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
        innerContainer = container.firstElementChild;
      });

      it('hides the container', () => {
        expect(innerContainer.style.display).toEqual('none');
      });

      it('call component.render()', () => {
        expect(component.render.called).toBe(true);
      });

      describe('when set back to false', () => {
        beforeEach(() => {
          props.shouldAutoHideContainer = false;
          ReactDOM.render(<AutoHide {...props} />, container);
        });

        it('shows the container', () => {
          expect(innerContainer.style.display).toNotEqual('none');
        });

        it('calls component.render()', () => {
          expect(component.render.calledTwice).toBe(true);
        });
      });
    });
  });
});
