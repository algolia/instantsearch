/** @jsx h */

import { h } from 'preact';
import cx from 'classnames';
import Template from '../Template/Template';
import { SearchResults } from 'algoliasearch-helper';
import { Hits } from '../../types';
import { InfiniteHitsTemplates } from '../../widgets/infinite-hits/infinite-hits';
import { SendEventForHits, BindEventForHits } from '../../lib/utils';

type InfiniteHitsCSSClasses = {
  root: string;
  emptyRoot: string;
  list: string;
  item: string;
  loadPrevious: string;
  disabledLoadPrevious: string;
  loadMore: string;
  disabledLoadMore: string;
};

export type InfiniteHitsProps = {
  cssClasses: InfiniteHitsCSSClasses;
  hits: Hits;
  results: SearchResults;
  hasShowPrevious: boolean;
  showPrevious: () => void;
  showMore: () => void;
  templateProps: {
    [key: string]: any;
    templates: InfiniteHitsTemplates;
  };
  isFirstPage: boolean;
  isLastPage: boolean;
  sendEvent: SendEventForHits;
  bindEvent: BindEventForHits;
};

const InfiniteHits = ({
  results,
  hits,
  bindEvent,
  hasShowPrevious,
  showPrevious,
  showMore,
  isFirstPage,
  isLastPage,
  cssClasses,
  templateProps,
}: InfiniteHitsProps) => {
  if (results.hits.length === 0) {
    return (
      <Template
        {...templateProps}
        templateKey="empty"
        rootProps={{
          className: cx(cssClasses.root, cssClasses.emptyRoot),
        }}
        data={results}
      />
    );
  }

  return (
    <div className={cssClasses.root}>
      {hasShowPrevious && (
        <Template
          {...templateProps}
          templateKey="showPreviousText"
          rootTagName="button"
          rootProps={{
            className: cx(cssClasses.loadPrevious, {
              [cssClasses.disabledLoadPrevious]: isFirstPage,
            }),
            disabled: isFirstPage,
            onClick: showPrevious,
          }}
        />
      )}

      <ol className={cssClasses.list}>
        {hits.map((hit, position) => (
          <Template
            {...templateProps}
            templateKey="item"
            rootTagName="li"
            rootProps={{ className: cssClasses.item }}
            key={hit.objectID}
            data={{
              ...hit,
              __hitIndex: position,
            }}
            bindEvent={bindEvent}
          />
        ))}
      </ol>

      <Template
        {...templateProps}
        templateKey="showMoreText"
        rootTagName="button"
        rootProps={{
          className: cx(cssClasses.loadMore, {
            [cssClasses.disabledLoadMore]: isLastPage,
          }),
          disabled: isLastPage,
          onClick: showMore,
        }}
      />
    </div>
  );
};

export default InfiniteHits;
