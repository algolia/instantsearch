import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';
import {
  readData as readAnalyticsData,
  hasData as hasAnalyticsData,
} from '../../helpers/analytics';

export default C =>
  class WithClickAnalyticsWrapper extends Component {
    static propTypes = {
      hits: PropTypes.array.isRequired,
      results: PropTypes.object.isRequired,
      analytics: PropTypes.object.isRequired,
    };

    constructor(props) {
      super(props);
      this.ref = null;
    }

    handleClick = ev => {
      if (!hasAnalyticsData(ev.target)) return;
      const { method, objectID, payload } = readAnalyticsData(ev.target);
      if (typeof this.props.analytics[method] !== 'function') {
        throw new Error(`Unknown insights method ${method}`);
      }
      this.props.analytics[method](objectID, payload);
    };

    componentDidMount() {
      this.ref.getDOMNode().addEventListener('click', this.handleClick);
    }

    componentWillUnmount() {
      this.ref.getDOMNode().removeEventListener('click', this.handleClick);
    }

    render() {
      const { analytics, ...otherProps } = this.props; // removing unused analytics
      return (
        <C
          ref={node => {
            this.ref = node;
          }}
          {...otherProps}
        />
      );
    }
  };
