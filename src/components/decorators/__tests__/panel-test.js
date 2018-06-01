import React, { Component } from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import { createRenderer } from 'react-test-renderer/shallow';

import panel from '../panel.js';

class TestComponent extends Component {
  render() {
    return <div {...this.props} />;
  }
}

describe('panel', () => {
  let renderer;
  let defaultProps;

  function render(props = {}) {
    const HeaderFooter = panel(TestComponent);
    renderer.render(<HeaderFooter {...props} />);
    return renderer.getRenderOutput();
  }

  function shallowRender(extraProps = {}) {
    const props = {
      templateProps: {},
      ...extraProps,
    };
    const componentWrappedInHeaderFooter = panel(TestComponent);
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
    expect(out).toMatchSnapshot();
  });

  it('should add a header if such a template is passed', () => {
    // Given
    defaultProps.templateProps.templates = {
      panelHeader: 'HEADER',
    };
    // When
    const out = render(defaultProps);
    // Then
    expect(out).toMatchSnapshot();
  });

  it('should add a footer if such a template is passed', () => {
    // Given
    defaultProps.templateProps.templates = {
      panelFooter: 'FOOTER',
    };
    // When
    const out = render(defaultProps);
    // Then
    expect(out).toMatchSnapshot();
  });

  describe('collapsible', () => {
    beforeEach(() => {
      defaultProps.templateProps.templates = {
        panelHeader: 'yo header',
        panelFooter: 'yo footer',
      };
    });

    it('when true', () => {
      defaultProps.collapsible = true;
      const out = render(defaultProps);
      expect(out).toMatchSnapshot();
    });

    it('when collapsed', () => {
      defaultProps.collapsible = { collapsed: true };
      const out = render(defaultProps);
      expect(out).toMatchSnapshot();
    });
  });

  describe('headerFooterData', () => {
    it('should call the header and footer template with the given data', () => {
      // Given
      const props = {
        headerFooterData: {
          panelHeader: {
            foo: 'bar',
          },
          panelFooter: {
            foo: 'baz',
          },
        },
        templateProps: {
          templates: {
            panelHeader: 'header',
            panelFooter: 'footer',
          },
        },
      };

      // When
      const actual = shallowRender(props);
      const header = actual.find({ templateKey: 'panelHeader' });
      const footer = actual.find({ templateKey: 'panelFooter' });

      // Then
      expect(header.props().data.foo).toEqual('bar');
      expect(footer.props().data.foo).toEqual('baz');
    });
  });

  describe('autoHideContainer', () => {
    it('hides the component if autoHideContainer is set to true', () => {
      const props = {
        shouldAutoHideContainer: true,
      };

      const actual = render(props);

      expect(actual).toMatchSnapshot();
    });
    it('shows the component if autoHideContainer is set to false', () => {});
    it('shows the component if autoHideContainer is not set', () => {});
  });
});
