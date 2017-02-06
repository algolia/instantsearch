/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import TestUtils from 'react-addons-test-utils';
import {RawClearAll as ClearAll} from '../ClearAll';
import Template from '../../Template';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

const {createRenderer} = TestUtils;

describe('ClearAll', () => {
  let renderer;
  const defaultProps = {
    clearAll: () => {},
    cssClasses: {
      link: 'custom-link',
    },
    hasRefinements: false,
    templateProps: {},
    url: '#all-cleared!',
  };

  beforeEach(() => {
    renderer = createRenderer();
  });

  it('should render <ClearAll />', () => {
    const out = render();
    expect(out).toEqualJSX(
      <a
        className="custom-link"
        href="#all-cleared!"
        onClick={() => {}}
      >
        <Template
          data={{hasRefinements: false}}
          templateKey="link"
        />
      </a>);
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

  function render(extraProps = {}) {
    const props = {
      ...defaultProps,
      ...extraProps,
    };
    renderer.render(<ClearAll {...props} />);
    return renderer.getRenderOutput();
  }
});
