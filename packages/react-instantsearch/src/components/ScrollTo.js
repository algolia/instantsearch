import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from './classNames.js';

const cx = classNames('ScrollTo');

class ScrollTo extends Component {
  static propTypes = {
    value: PropTypes.any,
    children: PropTypes.node,
    hasNotChanged: PropTypes.bool,
  };

  componentDidUpdate(prevProps) {
    const { value, hasNotChanged } = this.props;
    if (value !== prevProps.value && hasNotChanged) {
      this.el.scrollIntoView();
    }
  }

  render() {
    return (
      <div ref={ref => (this.el = ref)} {...cx('root')}>
        {this.props.children}
      </div>
    );
  }
}

export default ScrollTo;
