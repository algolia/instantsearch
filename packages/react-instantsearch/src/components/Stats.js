import React, {PropTypes, Component} from 'react';
import translatable from '../core/translatable';
import classNames from './classNames.js';

const cx = classNames('Stats');

class Stats extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    nbHits: PropTypes.number.isRequired,
    processingTimeMS: PropTypes.number.isRequired,
  };

  render() {
    const {translate, nbHits, processingTimeMS} = this.props;
    return (
      <span {...cx('root')}>
        {translate('stats', nbHits, processingTimeMS)}
      </span>
    );
  }
}

export default translatable({
  stats: (n, ms) =>
    `${n.toLocaleString()} results found in ${ms.toLocaleString()}ms`,
})(Stats);
