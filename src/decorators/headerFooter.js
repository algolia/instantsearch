// Issue with eslint + high-order components like decorators
/* eslint react/prop-types: 0 */

import React from 'react';

import cx from 'classnames';

import Template from '../components/Template.js';

function headerFooter(ComposedComponent) {
  class HeaderFooter extends React.Component {
    constructor(props) {
      super(props);
      this.handleHeaderClick = this.handleHeaderClick.bind(this);
      this.state = {
        collapsed: props.collapsible && props.collapsible.collapsed
      };

      this._headerElement = this._getElement({
        type: 'header',
        handleClick: props.collapsible ? this.handleHeaderClick : null
      });

      this._cssClasses = {
        root: cx('ais-root', this.props.cssClasses.root),
        body: cx('ais-body', this.props.cssClasses.body)
      };

      this._footerElement = this._getElement({type: 'footer'});
    }
    shouldComponentUpdate(nextProps, nextState) {
      return nextState.collapsed === false ||
        nextState !== this.state;
    }
    _getElement({type, handleClick = null}) {
      let templates = this.props.templateProps.templates;
      if (!templates || !templates[type]) {
        return null;
      }
      let className = cx(this.props.cssClasses[type], `ais-${type}`);
      return (
        <Template {...this.props.templateProps}
          onClick={handleClick}
          rootProps={{className}}
          templateKey={type}
          transformData={null}
        />
      );
    }
    handleHeaderClick() {
      this.setState({
        collapsed: !this.state.collapsed
      });
    }
    render() {
      let rootCssClasses = [this._cssClasses.root];

      if (this.props.collapsible) {
        rootCssClasses.push('ais-root__collapsible');
      }

      if (this.state.collapsed) {
        rootCssClasses.push('ais-root__collapsed');
      }

      const cssClasses = {
        ...this._cssClasses,
        root: cx(rootCssClasses)
      };

      return (
        <div className={cssClasses.root}>
          {this._headerElement}
          <div
            className={cssClasses.body}
          >
            <ComposedComponent {...this.props} />
          </div>
          {this._footerElement}
        </div>
      );
    }
  }

  HeaderFooter.propTypes = {
    collapsible: React.PropTypes.oneOfType([
      React.PropTypes.bool,
      React.PropTypes.shape({
        collapsed: React.PropTypes.bool
      })
    ]),
    cssClasses: React.PropTypes.shape({
      root: React.PropTypes.string,
      header: React.PropTypes.string,
      body: React.PropTypes.string,
      footer: React.PropTypes.string
    }),
    templateProps: React.PropTypes.object
  };

  HeaderFooter.defaultProps = {
    cssClasses: {},
    collapsible: false
  };

  // precise displayName for ease of debugging (react dev tool, react warnings)
  HeaderFooter.displayName = ComposedComponent.name + '-HeaderFooter';

  return HeaderFooter;
}

export default headerFooter;
