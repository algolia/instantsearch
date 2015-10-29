/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import TestComponent from './TestComponent';
import headerFooter from '../headerFooter';
import Template from '../../components/Template';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('headerFooter', () => {
  var renderer;
  var defaultProps;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    defaultProps = {
      cssClasses: {
        root: 'root',
        body: 'body'
      },
      templateProps: {
      }
    };
    renderer = createRenderer();
  });

  it('should render the component in a root and body', () => {
    var out = render(defaultProps);
    expect(out).toEqualJSX(
      <div className="root">
        <div className="body">
          <TestComponent {...defaultProps} />
        </div>
      </div>
    );
  });

  it('should add a header if such a template is passed', () => {
    // Given
    defaultProps.templateProps.templates = {
      header: 'HEADER'
    };
    // When
    var out = render(defaultProps);
    // Then
    var templateProps = {
      data: {},
      templateKey: 'header',
      transformData: null,
      templates: {
        header: 'HEADER'
      }
    };
    expect(out).toEqualJSX(
      <div className="root">
        <div className="ais-header">
          <Template {...templateProps} />
        </div>
        <div className="body">
          <TestComponent {...defaultProps} />
        </div>
      </div>
    );
  });

  it('should add a footer if such a template is passed', () => {
    // Given
    defaultProps.templateProps.templates = {
      footer: 'FOOTER'
    };
    // When
    var out = render(defaultProps);
    // Then
    var templateProps = {
      data: {},
      templateKey: 'footer',
      transformData: null,
      templates: {
        footer: 'FOOTER'
      }
    };
    expect(out).toEqualJSX(
      <div className="root">
        <div className="body">
          <TestComponent {...defaultProps} />
        </div>
        <div className="ais-footer">
          <Template {...templateProps} />
        </div>
      </div>
    );
  });

  function render(props = {}) {
    var HeaderFooter = headerFooter(TestComponent);
    renderer.render(<HeaderFooter {...props} />);
    return renderer.getRenderOutput();
  }
});

