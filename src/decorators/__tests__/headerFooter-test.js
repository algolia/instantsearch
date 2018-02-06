import React, { Component } from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import { createRenderer } from 'react-test-renderer/shallow';

import headerFooter from '../headerFooter';
import Template from '../../components/Template';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

class TestComponent extends Component {
  render() {
    return <div {...this.props} />;
  }
}

describe('headerFooter', () => {
  let renderer;
  let defaultProps;

  function render(props = {}) {
    const HeaderFooter = headerFooter(TestComponent);
    renderer.render(<HeaderFooter {...props} />);
    return renderer.getRenderOutput();
  }

  function shallowRender(extraProps = {}) {
    const props = {
      templateProps: {},
      ...extraProps,
    };
    const componentWrappedInHeaderFooter = headerFooter(TestComponent);
    return shallow(React.createElement(componentWrappedInHeaderFooter, props));
  }

  beforeEach(() => {
    defaultProps = {
      cssClasses: {
        root: 'root',
        body: 'body',
      },
      collapsible: false,
      templateProps: {},
    };
    renderer = createRenderer();
  });

  it('should render the component in a root and body', () => {
    const out = render(defaultProps);
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
      header: 'HEADER',
    };
    // When
    const out = render(defaultProps);
    // Then
    const templateProps = {
      data: undefined,
      templateKey: 'header',
      transformData: null,
      templates: {
        header: 'HEADER',
      },
    };
    expect(out).toEqualJSX(
      <div className="ais-root root">
        <Template
          rootProps={{ className: 'ais-header', onClick: null }}
          {...templateProps}
        />
        <div className="ais-body body">
          <TestComponent {...defaultProps} />
        </div>
      </div>
    );
  });

  it('should add a footer if such a template is passed', () => {
    // Given
    defaultProps.templateProps.templates = {
      footer: 'FOOTER',
    };
    // When
    const out = render(defaultProps);
    // Then
    const templateProps = {
      data: undefined,
      templateKey: 'footer',
      transformData: null,
      templates: {
        footer: 'FOOTER',
      },
    };
    expect(out).toEqualJSX(
      <div className="ais-root root">
        <div className="ais-body body">
          <TestComponent {...defaultProps} />
        </div>
        <Template
          rootProps={{ className: 'ais-footer', onClick: null }}
          {...templateProps}
        />
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
        footer: 'yo footer',
      };
      templateProps = {
        data: undefined,
        transformData: null,
        templates: {
          header: 'yo header',
          footer: 'yo footer',
        },
      };
      headerTemplateProps = {
        templateKey: 'header',
        ...templateProps,
      };
      footerTemplateProps = {
        templateKey: 'footer',
        ...templateProps,
      };
    });

    it('when true', () => {
      defaultProps.collapsible = true;
      const out = render(defaultProps);
      expect(out).toEqualJSX(
        <div className="ais-root root ais-root__collapsible">
          <Template
            rootProps={{ className: 'ais-header', onClick() {} }}
            {...headerTemplateProps}
          />
          <div className="ais-body body">
            <TestComponent {...defaultProps} />
          </div>
          <Template
            rootProps={{ className: 'ais-footer', onClick: null }}
            {...footerTemplateProps}
          />
        </div>
      );
    });

    it('when collapsed', () => {
      defaultProps.collapsible = { collapsed: true };
      const out = render(defaultProps);
      expect(out).toEqualJSX(
        <div className="ais-root root ais-root__collapsible ais-root__collapsed">
          <Template
            rootProps={{ className: 'ais-header', onClick() {} }}
            {...headerTemplateProps}
          />
          <div className="ais-body body">
            <TestComponent {...defaultProps} />
          </div>
          <Template
            rootProps={{ className: 'ais-footer', onClick: null }}
            {...footerTemplateProps}
          />
        </div>
      );
    });
  });

  describe('headerFooterData', () => {
    it('should call the header and footer template with the given data', () => {
      // Given
      const props = {
        headerFooterData: {
          header: {
            foo: 'bar',
          },
          footer: {
            foo: 'baz',
          },
        },
        templateProps: {
          templates: {
            header: 'header',
            footer: 'footer',
          },
        },
      };

      // When
      const actual = shallowRender(props);
      const header = actual.find({ templateKey: 'header' });
      const footer = actual.find({ templateKey: 'footer' });

      // Then
      expect(header.props().data.foo).toEqual('bar');
      expect(footer.props().data.foo).toEqual('baz');
    });
  });
});
