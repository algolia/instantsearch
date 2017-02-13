import React, {Component, PropTypes} from 'react';
import MultiIndexContext from './MultiIndexContext';

/**
 * Creates a specialized root MultiIndexContext component. It accepts
 * a specification of the root Element.
 * @param {object} root - the defininition of the root of an MultiIndexContext sub tree.
 * @returns {object} a MultiIndexContext root
 */
export default function createInstantSearch(root) {
  return class CreateInstantSearch extends Component {
    static propTypes = {
      children: React.PropTypes.oneOfType([
        React.PropTypes.arrayOf(React.PropTypes.node),
        React.PropTypes.node,
      ]),
      indexName: PropTypes.string.isRequired,
    };

    render() {
      return (
        <MultiIndexContext
          indexName={this.props.indexName}
          root={root}
          children={this.props.children}
        />
      );
    }
  };
}
