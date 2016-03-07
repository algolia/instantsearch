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
  let renderer;
  let defaultProps;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    defaultProps = {
      cssClasses: {
        root: 'root',
        body: 'body'
      },
      collapsible: false,
      templateProps: {
      }
    };
    renderer = createRenderer();
  });

  it('should render the component in a root and body', () => {
    let out = render(defaultProps);
    expect(out).toEqualJSX(
      <div className="ais-root root">
        <div className="ais-body body">
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
    let out = render(defaultProps);
    // Then
    let templateProps = {
      data: {},
      templateKey: 'header',
      transformData: null,
      templates: {
        header: 'HEADER'
      }
    };
    expect(out).toEqualJSX(
      <div className="ais-root root">
        <Template rootProps={{className: 'ais-header', onClick: null}} {...templateProps} />
        <div className="ais-body body">
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
    let out = render(defaultProps);
    // Then
    let templateProps = {
      data: {},
      templateKey: 'footer',
      transformData: null,
      templates: {
        footer: 'FOOTER'
      }
    };
    expect(out).toEqualJSX(
      <div className="ais-root root">
        <div className="ais-body body">
          <TestComponent {...defaultProps} />
        </div>
        <Template rootProps={{className: 'ais-footer', onClick: null}} {...templateProps} />
      </div>
    );
  });

  describe('collapsible', () => {
    let templateProps;
    let headerTemplateProps;
    let footerTemplateProps;

    beforeEach(() => {
      defaultProps.templateProps.templates = {
        header: 'yo header',
        footer: 'yo footer'
      };
      templateProps = {
        data: {},
        transformData: null,
        templates: {
          header: 'yo header',
          footer: 'yo footer'
        }
      };
      headerTemplateProps = {
        templateKey: 'header',
        ...templateProps
      };
      footerTemplateProps = {
        templateKey: 'footer',
        ...templateProps
      };
    });

    it('when true', () => {
      defaultProps.collapsible = true;
      let out = render(defaultProps);
      expect(out).toEqualJSX(
        <div className="ais-root root ais-root__collapsible">
          <Template rootProps={{className: 'ais-header', onClick: function() {}}} {...headerTemplateProps} />
          <div className="ais-body body">
            <TestComponent {...defaultProps} />
          </div>
          <Template rootProps={{className: 'ais-footer', onClick: null}} {...footerTemplateProps} />
        </div>
      );
    });

    it('when collapsed', () => {
      defaultProps.collapsible = {collapsed: true};
      let out = render(defaultProps);
      expect(out).toEqualJSX(
        <div className="ais-root root ais-root__collapsible ais-root__collapsed">
          <Template rootProps={{className: 'ais-header', onClick: function() {}}} {...headerTemplateProps} />
          <div className="ais-body body">
            <TestComponent {...defaultProps} />
          </div>
          <Template rootProps={{className: 'ais-footer', onClick: null}} {...footerTemplateProps} />
        </div>
      );
    });
  });

  function render(props = {}) {
    let HeaderFooter = headerFooter(TestComponent);
    renderer.render(<HeaderFooter {...props} />);
    return renderer.getRenderOutput();
  }
});

