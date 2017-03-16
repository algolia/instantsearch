import React from 'react';
import sinon from 'sinon';
import {RawClearAll as ClearAll} from '../ClearAll';
import renderer from 'react-test-renderer';

describe('ClearAll', () => {
  const defaultProps = {
    clearAll: () => {},
    cssClasses: {
      link: 'custom-link',
    },
    hasRefinements: false,
    templateProps: {
      templates: {
        link: '',
      },
    },
    url: '#all-cleared!',
  };

  it('should render <ClearAll />', () => {
    const tree = renderer.create(
      <ClearAll {...defaultProps} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should handle clicks (and special clicks)', () => {
    const props = {
      clearAll: sinon.spy(),
    };
    const preventDefault = sinon.spy();
    const component = new ClearAll(props);
    ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'].forEach(e => {
      const event = {preventDefault};
      event[e] = true;
      component.handleClick(event);
      expect(props.clearAll.called).toBe(false, 'clearAll never called');
      expect(preventDefault.called).toBe(false, 'preventDefault never called');
    });
    component.handleClick({preventDefault});
    expect(props.clearAll.calledOnce).toBe(true, 'clearAll called once');
    expect(preventDefault.calledOnce).toBe(true, 'preventDefault called once');
  });
});
