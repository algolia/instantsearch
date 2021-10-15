import { Hit as AlgoliaHit } from '@algolia/client-search';
import React from 'react';
import { useHits, UseHitsProps } from 'react-instantsearch-hooks';

import { cx } from '../cx';

export type HitsProps = React.ComponentProps<'div'> &
  UseHitsProps & {
    hitComponent: <THit extends AlgoliaHit<Record<string, unknown>>>(props: {
      hit: THit;
    }) => JSX.Element;
  };

export function Hits({ hitComponent: Hit, ...props }: HitsProps) {
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
