import React from 'react';

import { Hit as AlgoliaHit } from '@algolia/client-search';
import {
  useInfiniteHits,
  UseInfiniteHitsProps,
} from 'react-instantsearch-hooks';

import { cx } from '../cx';

export type InfiniteHitsProps<THit> = React.ComponentProps<'div'> &
  UseInfiniteHitsProps & {
    hitComponent: (props: { hit: THit }) => JSX.Element;
  };

export function InfiniteHits<THit extends AlgoliaHit<Record<string, unknown>>>({
  hitComponent: Hit,
  ...props
}: InfiniteHitsProps<THit>) {
  const { hits, isFirstPage, isLastPage, showMore, showPrevious } =
    useInfiniteHits(props);

  return (
    <div className={cx('ais-InfiniteHits', props.className)}>
      {props.showPrevious && (
        <button
          className={cx(
            'ais-InfiniteHits-loadPrevious',
            isFirstPage && 'ais-InfiniteHits-loadPrevious--disabled'
          )}
          onClick={showPrevious}
          disabled={isFirstPage}
        >
          Show previous results
        </button>
      )}
      <ol className="ais-InfiniteHits-list">
        {hits.map((hit) => (
          <li key={hit.objectID} className="ais-InfiniteHits-item">
            <Hit hit={hit as unknown as THit} />
          </li>
        ))}
      </ol>
      <button
        className={cx(
          'ais-InfiniteHits-loadMore',
          isLastPage && 'ais-InfiniteHits-loadMore--disabled'
        )}
        onClick={showMore}
        disabled={isLastPage}
      >
        Show more results
      </button>
    </div>
  );
}
