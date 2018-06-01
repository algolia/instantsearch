import PropTypes from 'prop-types';
// Issue with eslint + high-order components like decorators
/* eslint react/prop-types: 0 */

import React, { Component } from 'preact-compat';

import cx from 'classnames';
import getKey from 'lodash/get';

import Template from '../components/Template.js';

import { component } from '../lib/suit.js';

const suitPanel = component('Panel');

function headerFooter(ComposedComponent) {
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
      const rootClassnames = cx(suitPanel(), this.props.cssClasses.panelRoot, {
        [suitPanel({
          descendantName: 'root',
          modifierName: 'collapsible',
        })]: this.props.collapsible,
        [suitPanel({
          descendantName: 'root',
          modifierName: 'collapsed',
        })]: this.props.collapsed,
      });

      const bodyClassnames = cx(
        suitPanel({ descendantName: 'body' }),
        this.props.cssClasses.panelBody
      );

      const headerElement = this._getElement({
        type: 'Header',
        handleClick: this.props.collapsible ? this.handleHeaderClick : null,
      });

      const footerElement = this._getElement({ type: 'Footer' });

      return (
        <div className={rootClassnames}>
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
  };

  HeaderFooter.defaultProps = {
    cssClasses: {},
    collapsible: false,
  };

  // precise displayName for ease of debugging (react dev tool, react warnings)
  HeaderFooter.displayName = `${ComposedComponent.name}-HeaderFooter`;

  return HeaderFooter;
}

export default headerFooter;
