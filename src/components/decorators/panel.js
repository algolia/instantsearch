import PropTypes from 'prop-types';
// Issue with eslint + high-order components like decorators
/* eslint react/prop-types: 0 */

import React, { Component } from 'preact-compat';

import cx from 'classnames';
import getKey from 'lodash/get';

import Template from '../Template.js';

import { component } from '../../lib/suit.js';

const suitPanel = component('Panel');

function panel(ComposedComponent) {
  class HeaderFooter extends Component {
    constructor(props) {
      super(props);

      this.handleHeaderClick = () => {
        this.setState({
          collapsed: !this.state.collapsed,
        });
      };

      this.state = {
        collapsed: props.collapsible && props.collapsible.collapsed,
      };
    }

    _getElement({ type, handleClick = null }) {
      const elementKey = `panel${type}`;
      const templates =
        this.props.templateProps && this.props.templateProps.templates;
      if (!templates || !templates[elementKey]) {
        return null;
      }
      const className = cx(
        suitPanel({ descendantName: type }),
        this.props.cssClasses[elementKey]
      );

      const templateData = getKey(this.props, `headerFooterData.${elementKey}`);

      return (
        <Template
          {...this.props.templateProps}
          data={templateData}
          rootProps={{ className, onClick: handleClick }}
          templateKey={elementKey}
          transformData={null}
        />
      );
    }

    render() {
      const {
        shouldAutoHideContainer,
        cssClasses,
        collapsible,
        collapsed,
      } = this.props;

      const rootClassnames = cx(suitPanel(), cssClasses.panelRoot, {
        [suitPanel({
          descendantName: 'root',
          modifierName: 'collapsible',
        })]: collapsible,
        [suitPanel({
          descendantName: 'root',
          modifierName: 'collapsed',
        })]: collapsed,
      });

      const bodyClassnames = cx(
        suitPanel({ descendantName: 'body' }),
        cssClasses.panelBody
      );

      const headerElement = this._getElement({
        type: 'Header',
        handleClick: collapsible ? this.handleHeaderClick : null,
      });

      const footerElement = this._getElement({ type: 'Footer' });

      const autohideStyle = shouldAutoHideContainer
        ? { display: 'none' }
        : null;

      return (
        <div className={rootClassnames} style={autohideStyle}>
          {headerElement}
          <div className={bodyClassnames}>
            <ComposedComponent {...this.props} />
          </div>
          {footerElement}
        </div>
      );
    }
  }

  HeaderFooter.propTypes = {
    collapsible: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.shape({
        collapsed: PropTypes.bool,
      }),
    ]),
    cssClasses: PropTypes.shape({
      panelRoot: PropTypes.string,
      panelHeader: PropTypes.string,
      panelBody: PropTypes.string,
      panelFooter: PropTypes.string,
    }),
    templateProps: PropTypes.object,
    shouldAutoHideContainer: PropTypes.bool,
  };

  HeaderFooter.defaultProps = {
    cssClasses: {},
    collapsible: false,
  };

  // precise displayName for ease of debugging (react dev tool, react warnings)
  HeaderFooter.displayName = `${ComposedComponent.name}-Panel`;

  return HeaderFooter;
}

export default panel;
