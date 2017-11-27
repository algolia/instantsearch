import React from 'react';
import PropTypes from 'prop-types';
import classNames from './classNames.js';

const cx = classNames('Hits');

const Hits = ({ hits, hitComponent: HitComponent }) => (
  // Spread the hit on HitComponent instead of passing the full object. BC.
  // ex: <HitComponent {...hit} key={hit.objectID} />
  <div {...cx('root')}>
    {hits.map(hit => <HitComponent key={hit.objectID} hit={hit} />)}
  </div>
);

Hits.propTypes = {
  hits: PropTypes.array,
  hitComponent: PropTypes.func.isRequired,
};

Hits.defaultProps = {
  hitComponent: props => (
    <div
      style={{
        borderBottom: '1px solid #bbb',
        paddingBottom: '5px',
        marginBottom: '5px',
      }}
    >
      {JSON.stringify(props).slice(0, 100)}...
    </div>
  ),
};

export default Hits;
