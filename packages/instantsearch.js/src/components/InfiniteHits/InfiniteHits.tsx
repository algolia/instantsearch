/** @jsx h */

import { cx } from '@algolia/ui-components-shared';
import { h } from 'preact';

import { warning } from '../../lib/utils';
import Template from '../Template/Template';

import type { SendEventForHits, BindEventForHits } from '../../lib/utils';
import type { ComponentCSSClasses, Hit } from '../../types';
import type {
  InfiniteHitsCSSClasses,
  InfiniteHitsTemplates,
} from '../../widgets/infinite-hits/infinite-hits';
import type { SearchResults } from 'algoliasearch-helper';

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
  sendEvent,
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
            className: cx(
              cssClasses.loadPrevious,
              isFirstPage && cssClasses.disabledLoadPrevious
            ),
            disabled: isFirstPage,
            onClick: showPrevious,
          }}
        />
      )}

      <ol className={cssClasses.list}>
        {hits.map((hit, index) => (
          <Template
            {...templateProps}
            templateKey="item"
            rootTagName="li"
            rootProps={{
              className: cssClasses.item,
              onClick: () => {
                sendEvent('click', hit, 'Hit Clicked');
              },
            }}
            key={hit.objectID}
            data={{
              ...hit,
              get __hitIndex() {
                warning(
                  false,
                  'The `__hitIndex` property is deprecated. Use the absolute `__position` instead.'
                );
                return index;
              },
            }}
            bindEvent={bindEvent}
            sendEvent={sendEvent}
          />
        ))}
      </ol>

      <Template
        {...templateProps}
        templateKey="showMoreText"
        rootTagName="button"
        rootProps={{
          className: cx(
            cssClasses.loadMore,
            isLastPage && cssClasses.disabledLoadMore
          ),
          disabled: isLastPage,
          onClick: showMore,
        }}
      />
    </div>
  );
};

export default InfiniteHits;
