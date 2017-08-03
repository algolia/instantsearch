import PropTypes from 'prop-types';
import { Component, Children } from 'react';
import { findDOMNode } from 'react-dom';

class ScrollTo extends Component {
  static propTypes = {
    value: PropTypes.any,
    children: PropTypes.node,
    hasNotChanged: PropTypes.bool,
  };

  componentDidUpdate(prevProps) {
    const { value, hasNotChanged } = this.props;
    if (value !== prevProps.value && hasNotChanged) {
      const el = findDOMNode(this);
      el.scrollIntoView();
    }
  }

  render() {
    return Children.only(this.props.children);
  }
}

export default ScrollTo;
