import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import autoHideContainer from '../autoHideContainer';

class TestComponent extends Component {
  render() {
    return <div>{this.props.hello}</div>;
  }
}

TestComponent.propTypes = {
  hello: PropTypes.string,
};

describe('autoHideContainer', () => {
  let props = {};

  it('should render autoHideContainer(<TestComponent />)', () => {
    props.hello = 'son';
    const AutoHide = autoHideContainer(TestComponent);
    const out = shallow(<AutoHide shouldAutoHideContainer {...props} />);
    expect(out).toMatchSnapshot();
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
      expect(component).toBeDefined();
    });

    it('shows the container at first', () => {
      expect(container.style.display).not.toEqual('none');
    });

    describe('when set to true', () => {
      beforeEach(() => {
        jest.spyOn(component, 'render');
        props.shouldAutoHideContainer = true;
        ReactDOM.render(<AutoHide {...props} />, container);
        innerContainer = container.firstElementChild;
      });

      it('hides the container', () => {
        expect(innerContainer.style.display).toEqual('none');
      });

      it('call component.render()', () => {
        expect(component.render).toHaveBeenCalled();
      });

      describe('when set back to false', () => {
        beforeEach(() => {
          props.shouldAutoHideContainer = false;
          ReactDOM.render(<AutoHide {...props} />, container);
        });

        it('shows the container', () => {
          expect(innerContainer.style.display).not.toEqual('none');
        });

        it('calls component.render()', () => {
          expect(component.render).toHaveBeenCalledTimes(2);
        });
      });
    });
  });
});
