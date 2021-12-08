import React from 'react';
import { useHits } from 'react-instantsearch-hooks';

import { cx } from '../cx';

export function Hits({ hitComponent: Hit, ...props }) {
  const { hits } = useHits(props);

  return (
    <div className={cx('ais-Hits', props.className)}>
      <ol className="ais-Hits-list">
        {hits.map((hit) => (
          <li key={hit.objectID} className="ais-Hits-item">
            <Hit hit={hit} />
          </li>
        ))}
      </ol>
    </div>
  );
}
