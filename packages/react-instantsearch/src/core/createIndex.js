import React, { Component, PropTypes } from 'react';
import Index from './Index';

/**
 * Creates a specialized root Index component. It accepts
 * a specification of the root Element.
 * @param {object} root - the defininition of the root of an Index sub tree.
 * @returns {object} a Index root
 */
export default function createIndex(root) {
  return class CreateIndex extends Component {
    static propTypes = {
      children: React.PropTypes.oneOfType([
        React.PropTypes.arrayOf(React.PropTypes.node),
        React.PropTypes.node,
      ]),
      indexName: PropTypes.string.isRequired,
    };

    render() {
      return (
        <Index
          indexName={this.props.indexName}
          root={root}
          children={this.props.children}
        />
      );
    }
  };
}
