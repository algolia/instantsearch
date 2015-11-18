/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import sinon from 'sinon';
import TestUtils from 'react-addons-test-utils';
import ClearAll from '../ClearAll.js';
import Template from '../../Template.js';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

let {createRenderer} = TestUtils;

describe('ClearAll', () => {
  let renderer;
  let defaultProps = {
    clearAll: () => {},
    cssClasses: {
      link: 'custom-link'
    },
    hasRefinements: false,
    templateProps: {},
    url: '#all-cleared!'
  };

  beforeEach(() => {
    renderer = createRenderer();
  });

  it('should render <ClearAll />', () => {
    let out = render();
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
    let props = {
      clearAll: sinon.spy()
    };
    let preventDefault = sinon.spy();
    let component = new ClearAll(props);
    ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'].forEach((e) => {
      let event = {preventDefault};
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
    let props = {
      ...defaultProps,
      ...extraProps
    };
    renderer.render(<ClearAll {...props} />);
    return renderer.getRenderOutput();
  }
});
