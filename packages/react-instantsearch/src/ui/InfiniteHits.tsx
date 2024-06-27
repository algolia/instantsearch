import { cx } from 'instantsearch-ui-components';
import React from 'react';

import type { Banner } from 'algoliasearch-helper';
import type { Hit } from 'instantsearch.js';
import type { SendEventForHits } from 'instantsearch.js/es/lib/utils';

export type InfiniteHitsProps<THit> = React.ComponentProps<'div'> & {
  hits: THit[];
  banner?: Banner;
  sendEvent: SendEventForHits;
  hitComponent?: React.JSXElementConstructor<{
    hit: THit;
    sendEvent: SendEventForHits;
  }>;
  bannerComponent?: React.JSXElementConstructor<{
    className: string;
    banner: Banner;
  }>;
  isFirstPage: boolean;
  isLastPage: boolean;
  onShowPrevious?: () => void;
  onShowMore: () => void;
  classNames?: Partial<InfiniteHitsClassNames>;
  translations: InfiniteHitsTranslations;
};

export type InfiniteHitsClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string;
  /**
   * Class names to apply to the root element without results
   */
  emptyRoot: string;
  /**
   * Class names to apply to the "load previous" button
   */
  loadPrevious: string;
  /**
   * Class names to apply to the "load previous" button when it's disabled
   */
  disabledLoadPrevious: string;
  /**
   * Class names to apply to the "load more" button
   */
  loadMore: string;
  /**
   * Class names to apply to the "load more" button when it's disabled
   */
  disabledLoadMore: string;
  /**
   * Class names to apply to the list element
   */
  list: string;
  /**
   * Class names to apply to each item element
   */
  item: string;
  /**
   * Class names to apply to the banner element
   */
  bannerRoot: string | string[];

  /**
   * Class names to apply to the banner image element
   */
  bannerImage: string | string[];

  /**
   * Class names to apply to the banner link element
   */
  bannerLink: string | string[];
};

export type InfiniteHitsTranslations = {
  showPreviousButtonText: string;
  showMoreButtonText: string;
};

function DefaultHitComponent({ hit }: { hit: Hit }) {
  return (
    <div style={{ wordBreak: 'break-all' }}>
      {JSON.stringify(hit).slice(0, 100)}…
    </div>
  );
}

type BannerProps = {
  banner: Banner;
  classNames: Pick<
    Partial<InfiniteHitsClassNames>,
    'bannerRoot' | 'bannerLink' | 'bannerImage'
  >;
};

function DefaultBanner({ classNames, banner }: BannerProps) {
  if (!banner.image.urls[0].url) {
    return null;
  }
  return (
    <aside className={cx('ais-InfiniteHits-banner', classNames.bannerRoot)}>
      {banner.link ? (
        <a
          className={cx('ais-InfiniteHits-banner-link', classNames.bannerLink)}
          href={banner.link.url}
          target={banner.link.target}
        >
          <img
            className={cx(
              'ais-InfiniteHits-banner-image',
              classNames.bannerImage
            )}
            src={banner.image.urls[0].url}
            alt={banner.image.title}
          />
        </a>
      ) : (
        <img
          className={cx(
            'ais-InfiniteHits-banner-image',
            classNames.bannerImage
          )}
          src={banner.image.urls[0].url}
          alt={banner.image.title}
        />
      )}
    </aside>
  );
}

export function InfiniteHits<THit extends Hit>({
  hitComponent: HitComponent = DefaultHitComponent,
  hits,
  bannerComponent: BannerComponent,
  banner,
  sendEvent,
  isFirstPage,
  isLastPage,
  onShowPrevious,
  onShowMore,
  classNames = {},
  translations,
  ...props
}: InfiniteHitsProps<THit>) {
  return (
    <div
      {...props}
      className={cx(
        'ais-InfiniteHits',
        classNames.root,
        hits.length === 0 &&
          cx('ais-InfiniteHits--empty', classNames.emptyRoot),
        props.className
      )}
    >
      {onShowPrevious && (
        <button
          className={cx(
            'ais-InfiniteHits-loadPrevious',
            classNames.loadPrevious,
            isFirstPage &&
              cx(
                'ais-InfiniteHits-loadPrevious--disabled',
                classNames.disabledLoadPrevious
              )
          )}
          onClick={onShowPrevious}
          disabled={isFirstPage}
        >
          {translations.showPreviousButtonText}
        </button>
      )}
      {banner &&
        (BannerComponent ? (
          <BannerComponent
            className={cx('ais-InfiniteHits-banner', classNames.bannerRoot)}
            banner={banner}
          />
        ) : (
          <DefaultBanner classNames={classNames} banner={banner} />
        ))}
      <ol className={cx('ais-InfiniteHits-list', classNames.list)}>
        {hits.map((hit) => (
          <li
            key={hit.objectID}
            className={cx('ais-InfiniteHits-item', classNames.item)}
            onClick={() => {
              sendEvent('click:internal', hit, 'Hit Clicked');
            }}
            onAuxClick={() => {
              sendEvent('click:internal', hit, 'Hit Clicked');
            }}
          >
            <HitComponent hit={hit} sendEvent={sendEvent} />
          </li>
        ))}
      </ol>
      <button
        className={cx(
          'ais-InfiniteHits-loadMore',
          classNames.loadMore,
          isLastPage &&
            cx(
              'ais-InfiniteHits-loadMore--disabled',
              classNames.disabledLoadMore
            )
        )}
        onClick={onShowMore}
        disabled={isLastPage}
      >
        {translations.showMoreButtonText}
      </button>
    </div>
  );
}
