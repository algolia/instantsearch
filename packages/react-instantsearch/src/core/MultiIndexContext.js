import React, {PropTypes, Component, Children} from 'react';

class MultiIndexContext extends Component {
  getChildContext() {
    return {
      multiIndexContext: {
        targettedIndex: this.props.indexName,
      },
    };
  }

  render() {
    const childrenCount = Children.count(this.props.children);
    const {Root, props} = this.props.root;
    if (childrenCount === 0)
      return null;
    else
      return <Root {...props}>{this.props.children}</Root>;
  }
}

MultiIndexContext.propTypes = {
  // @TODO: These props are currently constant.
  indexName: PropTypes.string.isRequired,
  children: PropTypes.node,
  root: PropTypes.shape({
    Root: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.func,
    ]),
    props: PropTypes.object,
  }).isRequired,
};

MultiIndexContext.childContextTypes = {
  // @TODO: more precise widgets manager propType
  multiIndexContext: PropTypes.object.isRequired,
};

export default MultiIndexContext;
