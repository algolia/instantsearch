// Issue with eslint + high-order components like decorators
/* eslint react/prop-types: 0 */

import React from 'react';

import cx from 'classnames';

import Template from '../components/Template.js';

function headerFooter(ComposedComponent) {
  class HeaderFooter extends React.Component {
    componentWillMount() {
      // Only add header/footer if a template is defined
      this._header = this.getTemplate('header');
      this._footer = this.getTemplate('footer');
      this._classNames = {
        root: cx(this.props.cssClasses.root),
        body: cx(this.props.cssClasses.body)
      };
    }
    getTemplate(type) {
      let templates = this.props.templateProps.templates;
      if (!templates || !templates[type]) {
        return null;
      }
      let className = cx(this.props.cssClasses[type], `ais-${type}`);
      return (
        <Template {...this.props.templateProps}
          cssClass={className}
          templateKey={type}
          transformData={null}
        />
      );
    }
    render() {
      return (
        <div className={this._classNames.root}>
          {this._header}
          <div className={this._classNames.body}>
            <ComposedComponent {...this.props} />
          </div>
          {this._footer}
        </div>
      );
    }
  }

  HeaderFooter.propTypes = {
    cssClasses: React.PropTypes.shape({
      root: React.PropTypes.string,
      header: React.PropTypes.string,
      body: React.PropTypes.string,
      footer: React.PropTypes.string
    }),
    templateProps: React.PropTypes.object
  };

  HeaderFooter.defaultProps = {
    cssClasses: {}
  };

  // precise displayName for ease of debugging (react dev tool, react warnings)
  HeaderFooter.displayName = ComposedComponent.name + '-HeaderFooter';

  return HeaderFooter;
}

export default headerFooter;
