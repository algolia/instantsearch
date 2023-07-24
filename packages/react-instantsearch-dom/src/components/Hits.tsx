import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { createClassNames } from '../core/utils';

type Hit = {
  objectID: string | number;
};

type HitProps = {
  hit: Hit;
};

type Props = {
  hits: Hit[];
  className?: string;
  hitComponent?:
    | string
    | React.ElementType<HitProps>
    | React.ExoticComponent<HitProps>;
};

const cx = createClassNames('Hits');

const DefaultHitComponent: React.FC<HitProps> = (props) => (
  <div
    style={{
      borderBottom: '1px solid #bbb',
      paddingBottom: '5px',
      marginBottom: '5px',
      wordBreak: 'break-all',
    }}
  >
    {JSON.stringify(props).slice(0, 100)}
    ...
  </div>
);

const Hits: React.FC<Props> = ({
  hits,
  className = '',
  hitComponent: HitComponent = DefaultHitComponent,
}) => (
  <div className={classNames(cx(''), className)}>
    <ul className={cx('list')}>
      {hits.map((hit) => (
        <li className={cx('item')} key={hit.objectID}>
          <HitComponent hit={hit} />
        </li>
      ))}
    </ul>
  </div>
);

const HitPropTypes = PropTypes.shape({
  objectID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
});

Hits.propTypes = {
  hits: PropTypes.arrayOf(HitPropTypes.isRequired).isRequired,
  className: PropTypes.string,

  // this is actually PropTypes.elementType, but our prop-types version is outdated
  hitComponent: PropTypes.any,
};

export default Hits;
