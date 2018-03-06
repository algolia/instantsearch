import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import createClassNames from '../components/createClassNames';

const cx = createClassNames('Hits');

const Hits = ({ hits, className, hitComponent: HitComponent }) => (
  // Spread the hit on HitComponent instead of passing the full object. BC.
  // ex: <HitComponent {...hit} key={hit.objectID} />
  <div className={classNames(cx(''), className)}>
    <ul className={cx('list')}>
      {hits.map(hit => (
        <li className={cx('item')} key={hit.objectID}>
          <HitComponent hit={hit} />
        </li>
      ))}
    </ul>
  </div>
);

Hits.propTypes = {
  hits: PropTypes.arrayOf(PropTypes.object).isRequired,
  className: PropTypes.string,
  hitComponent: PropTypes.func,
};

Hits.defaultProps = {
  className: '',
  hitComponent: props => (
    <div
      style={{
        borderBottom: '1px solid #bbb',
        paddingBottom: '5px',
        marginBottom: '5px',
        wordBreak: 'break-all',
      }}
    >
      {JSON.stringify(props).slice(0, 100)}...
    </div>
  ),
};

export default Hits;
