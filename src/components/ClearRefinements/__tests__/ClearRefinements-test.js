import React from 'react';
import sinon from 'sinon';
import ClearRefinements from '../ClearRefinements';
import renderer from 'react-test-renderer';

describe('ClearRefinements', () => {
  const defaultProps = {
    refine: () => {},
    cssClasses: {
      button: 'custom-button',
      root: 'custom-root',
    },
    hasRefinements: true,
    templateProps: {
      templates: {
        button: '',
      },
    },
    url: '#all-cleared!',
  };

  it('should render <ClearRefinements />', () => {
    const tree = renderer
      .create(<ClearRefinements {...defaultProps} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render a disabled <ClearRefinements />', () => {
    const props = {
      ...defaultProps,
      hasRefinements: false,
    };
    const tree = renderer.create(<ClearRefinements {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render a disabled <ClearRefinements /> with a custom css class', () => {
    const props = {
      ...defaultProps,
      hasRefinements: false,
      cssClasses: {
        ...defaultProps.cssClasses,
        disabledButton: 'custom-disabled-button',
      },
    };
    const tree = renderer.create(<ClearRefinements {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should handle clicks (and special clicks)', () => {
    const props = {
      refine: sinon.spy(),
    };
    const preventDefault = sinon.spy();
    const component = new ClearRefinements(props);
    ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'].forEach(e => {
      const event = { preventDefault };
      event[e] = true;
      component.handleClick(event);
      expect(props.refine.called).toBe(false, 'clearAll never called');
      expect(preventDefault.called).toBe(false, 'preventDefault never called');
    });
    component.handleClick({ preventDefault });
    expect(props.refine.calledOnce).toBe(true, 'clearAll called once');
    expect(preventDefault.calledOnce).toBe(true, 'preventDefault called once');
  });
});
