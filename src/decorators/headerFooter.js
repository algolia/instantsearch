import PropTypes from 'prop-types';
// Issue with eslint + high-order components like decorators
/* eslint react/prop-types: 0 */

import React, { Component } from 'preact-compat';

import cx from 'classnames';
import getKey from 'lodash/get';

import Template from '../components/Template.js';

function headerFooter(ComposedComponent) {
  class HeaderFooter extends Component {
    constructor(props) {
      super(props);
      this.handleHeaderClick = this.handleHeaderClick.bind(this);
      this.state = {
        collapsed: props.collapsible && props.collapsible.collapsed,
      };

      this._cssClasses = {
        root: cx('ais-root', this.props.cssClasses.root),
        body: cx('ais-body', this.props.cssClasses.body),
      };

      this._footerElement = this._getElement({ type: 'footer' });
    }
    _getElement({ type, handleClick = null }) {
      const templates =
        this.props.templateProps && this.props.templateProps.templates;
      if (!templates || !templates[type]) {
        return null;
      }
      const className = cx(this.props.cssClasses[type], `ais-${type}`);

      const templateData = getKey(this.props, `headerFooterData.${type}`);

      return (
        <Template
          {...this.props.templateProps}
          data={templateData}
          rootProps={{ className, onClick: handleClick }}
          templateKey={type}
          transformData={null}
        />
      );
    }
    handleHeaderClick() {
      this.setState({
        collapsed: !this.state.collapsed,
      });
    }
    render() {
      const rootCssClasses = [this._cssClasses.root];

      if (this.props.collapsible) {
        rootCssClasses.push('ais-root__collapsible');
      }

      if (this.state.collapsed) {
        rootCssClasses.push('ais-root__collapsed');
      }

      const cssClasses = {
        ...this._cssClasses,
        root: cx(rootCssClasses),
      };

      const headerElement = this._getElement({
        type: 'header',
        handleClick: this.props.collapsible ? this.handleHeaderClick : null,
      });

      return (
        <div className={cssClasses.root}>
          {headerElement}
          <div className={cssClasses.body}>
            <ComposedComponent {...this.props} />
          </div>
          {this._footerElement}
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
      root: PropTypes.string,
      header: PropTypes.string,
      body: PropTypes.string,
      footer: PropTypes.string,
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
