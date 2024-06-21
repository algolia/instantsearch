/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h } from 'preact';

import { createInsightsEventHandler } from '../../lib/insights/listener';
import { warning } from '../../lib/utils';
import Template from '../Template/Template';

import type { SendEventForHits, BindEventForHits } from '../../lib/utils';
import type { ComponentCSSClasses, Hit, InsightsClient } from '../../types';
import type {
  InfiniteHitsCSSClasses,
  InfiniteHitsTemplates,
} from '../../widgets/infinite-hits/infinite-hits';
import type { Banner, SearchResults } from 'algoliasearch-helper';

export type InfiniteHitsComponentCSSClasses =
  ComponentCSSClasses<InfiniteHitsCSSClasses>;
export type InfiniteHitsComponentTemplates = InfiniteHitsTemplates;

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
  insights?: InsightsClient;
  sendEvent: SendEventForHits;
  bindEvent: BindEventForHits;
  banner?: Banner;
};

const DefaultBanner = ({
  banner,
  classNames,
}: {
  banner: Banner;
  classNames: Pick<
    InfiniteHitsCSSClasses,
    'bannerRoot' | 'bannerLink' | 'bannerImage'
  >;
}) => {
  if (!banner.image.urls[0].url) {
    return null;
  }

  return (
    <aside className={cx(classNames.bannerRoot)}>
      {banner.link ? (
        <a
          className={cx(classNames.bannerLink)}
          href={banner.link.url}
          target={banner.link.target}
        >
          <img
            className={cx(classNames.bannerImage)}
            src={banner.image.urls[0].url}
            alt={banner.image.title}
          />
        </a>
      ) : (
        <img
          className={cx(classNames.bannerImage)}
          src={banner.image.urls[0].url}
          alt={banner.image.title}
        />
      )}
    </aside>
  );
};

const InfiniteHits = ({
  results,
  hits,
  insights,
  bindEvent,
  sendEvent,
  hasShowPrevious,
  showPrevious,
  showMore,
  isFirstPage,
  isLastPage,
  cssClasses,
  templateProps,
  banner,
}: InfiniteHitsProps) => {
  const handleInsightsClick = createInsightsEventHandler({
    insights,
    sendEvent,
  });

  if (results.hits.length === 0) {
    return (
      <div
        className={cx(cssClasses.root, cssClasses.emptyRoot)}
        onClick={handleInsightsClick}
      >
        {banner &&
          (templateProps.templates.banner ? (
            <Template
              {...templateProps}
              templateKey="banner"
              rootTagName="fragment"
              data={{
                banner,
                className: cssClasses.bannerRoot,
              }}
            />
          ) : (
            <DefaultBanner banner={banner} classNames={cssClasses} />
          ))}
        <Template
          {...templateProps}
          templateKey="empty"
          rootTagName="fragment"
          data={results}
        />
      </div>
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

      {banner &&
        (templateProps.templates.banner ? (
          <Template
            {...templateProps}
            templateKey="banner"
            rootTagName="fragment"
            data={{
              banner,
              className: cssClasses.bannerRoot,
            }}
          />
        ) : (
          <DefaultBanner banner={banner} classNames={cssClasses} />
        ))}

      <ol className={cssClasses.list}>
        {hits.map((hit, index) => (
          <Template
            {...templateProps}
            templateKey="item"
            rootTagName="li"
            rootProps={{
              className: cssClasses.item,
              onClick: (event: MouseEvent) => {
                handleInsightsClick(event);
                sendEvent('click:internal', hit, 'Hit Clicked');
              },
              onAuxClick: (event: MouseEvent) => {
                handleInsightsClick(event);
                sendEvent('click:internal', hit, 'Hit Clicked');
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
