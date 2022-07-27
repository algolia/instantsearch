/** @jsx h */

import { h } from 'preact';
import cx from 'classnames';
import Template from '../Template/Template';
import type { SearchResults } from 'algoliasearch-helper';
import type { ComponentCSSClasses, Hit } from '../../types';
import type {
  InfiniteHitsCSSClasses,
  InfiniteHitsTemplates,
} from '../../widgets/infinite-hits/infinite-hits';
import type { SendEventForHits, BindEventForHits } from '../../lib/utils';

export type InfiniteHitsComponentCSSClasses =
  ComponentCSSClasses<InfiniteHitsCSSClasses>;
export type InfiniteHitsComponentTemplates = Required<InfiniteHitsTemplates>;

export type InfiniteHitsProps = {
  cssClasses: InfiniteHitsComponentCSSClasses;
  hits: Hit[];
  results: SearchResults;
  hasShowPrevious: boolean;
  showPrevious: () => void;
  showMore: () => void;
  templateProps: {
    [key: string]: any;
    templates: InfiniteHitsComponentTemplates;
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
