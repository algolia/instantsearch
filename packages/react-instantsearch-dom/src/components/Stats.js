import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import translatable from '../core/translatable';
import createClassNames from '../core/createClassNames';

const cx = createClassNames('Stats');

class Stats extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    nbHits: PropTypes.number.isRequired,
    processingTimeMS: PropTypes.number.isRequired,
    className: PropTypes.string,
  };

  static defaultProps = {
    className: '',
  };

  render() {
    const { translate, nbHits, processingTimeMS, className } = this.props;

    return (
      <div className={classNames(cx(''), className)}>
        <span className={cx('text')}>
          {translate('stats', nbHits, processingTimeMS)}
        </span>
      </div>
    );
  }
}

export default translatable({
  stats: (n, ms) =>
    `${n.toLocaleString()} results found in ${ms.toLocaleString()}ms`,
})(Stats);
