/** @jsx createElement */
import { cx } from '../lib';

import { createDefaultHitComponent } from './DefaultHit';

import type { ComponentProps, Renderer, SendEventForHits } from '../types';
import type { Banner } from 'algoliasearch-helper';

// Should be imported from a shared package in the future
type Hit = Record<string, unknown> & {
  objectID: string;
};

type BannerProps = {
  banner: Banner;
  classNames: Pick<
    Partial<InfiniteHitsClassNames>,
    'bannerRoot' | 'bannerLink' | 'bannerImage'
  >;
};

type ButtonProps = {
  className: string;
  disabled: boolean;
  onClick: () => void;
};

function createDefaultBannerComponent({ createElement }: Renderer) {
  return function DefaultBanner({ classNames, banner }: BannerProps) {
    if (!banner.image.urls[0].url) {
      return null;
    }
    return (
      <aside className={cx('ais-InfiniteHits-banner', classNames.bannerRoot)}>
        {banner.link ? (
          <a
            className={cx(
              'ais-InfiniteHits-banner-link',
              classNames.bannerLink
            )}
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
  };
}

export type InfiniteHitsItemComponentProps<THit> = {
  hit: THit;
  index: number;
  className: string;
  onClick: () => void;
  onAuxClick: () => void;
  key?: string | number;
};

export type InfiniteHitsProps<THit> = ComponentProps<'div'> & {
  hits: THit[];
  /**
   * Component to render each hit, including its `<li>` root.
   * Defaults to a list item rendering the hit as JSON.
   */
  itemComponent?: (props: InfiniteHitsItemComponentProps<THit>) => JSX.Element;
  sendEvent: SendEventForHits;
  classNames?: Partial<InfiniteHitsClassNames>;
  emptyComponent?: (props: { className?: string }) => JSX.Element;
  banner?: Banner;
  bannerComponent?: (props: {
    className: string;
    banner: Banner;
  }) => JSX.Element;
  isFirstPage: boolean;
  isLastPage: boolean;
  onShowPrevious?: () => void;
  onShowMore: () => void;
  /**
   * Component rendering the whole "Show previous" button, in place of the
   * default one.
   */
  loadPreviousComponent?: (props: ButtonProps) => JSX.Element;
  /**
   * Component rendering the whole "Show more" button, in place of the default
   * one.
   */
  loadMoreComponent?: (props: ButtonProps) => JSX.Element;
  translations?: Partial<InfiniteHitsTranslations>;
};

export type InfiniteHitsClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the root element without results
   */
  emptyRoot: string | string[];
  /**
   * Class names to apply to the "load previous" button
   */
  loadPrevious: string | string[];
  /**
   * Class names to apply to the "load previous" button when it's disabled
   */
  disabledLoadPrevious: string | string[];
  /**
   * Class names to apply to the "load more" button
   */
  loadMore: string | string[];
  /**
   * Class names to apply to the "load more" button when it's disabled
   */
  disabledLoadMore: string | string[];
  /**
   * Class names to apply to the list element
   */
  list: string | string[];
  /**
   * Class names to apply to each item element
   */
  item: string | string[];
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
  /**
   * Label of the "Show previous" button
   */
  showPreviousButtonText: string;
  /**
   * Label of the "Show more" button
   */
  showMoreButtonText: string;
};

const DEFAULT_TRANSLATIONS: InfiniteHitsTranslations = {
  showPreviousButtonText: 'Show previous results',
  showMoreButtonText: 'Show more results',
};

export function createInfiniteHitsComponent({
  createElement,
  Fragment,
}: Renderer) {
  const DefaultBannerComponent = createDefaultBannerComponent({
    createElement,
    Fragment,
  });
  const DefaultHit = createDefaultHitComponent({ createElement, Fragment });

  function DefaultItemComponent<THit extends Hit>({
    hit,
    index: _index,
    ...rootProps
  }: InfiniteHitsItemComponentProps<THit>) {
    return (
      <li {...rootProps}>
        <DefaultHit hit={hit} />
      </li>
    );
  }

  return function InfiniteHits<THit extends Hit>(
    userProps: InfiniteHitsProps<THit>
  ) {
    const {
      classNames = {},
      hits,
      itemComponent: ItemComponent = DefaultItemComponent,
      sendEvent,
      emptyComponent: EmptyComponent,
      banner,
      bannerComponent: BannerComponent,
      isFirstPage,
      isLastPage,
      onShowPrevious,
      onShowMore,
      loadPreviousComponent: LoadPreviousComponent,
      loadMoreComponent: LoadMoreComponent,
      translations: userTranslations,
      ...props
    } = userProps;

    const translations: InfiniteHitsTranslations = {
      ...DEFAULT_TRANSLATIONS,
      ...userTranslations,
    };

    const rootClassName = cx(
      'ais-InfiniteHits',
      classNames.root,
      hits.length === 0 && cx('ais-InfiniteHits--empty', classNames.emptyRoot),
      props.className
    );

    const bannerElement =
      banner &&
      (BannerComponent ? (
        <BannerComponent
          className={cx('ais-InfiniteHits-banner', classNames.bannerRoot)}
          banner={banner}
        />
      ) : (
        <DefaultBannerComponent classNames={classNames} banner={banner} />
      ));

    if (hits.length === 0 && EmptyComponent) {
      return (
        <div {...props} className={rootClassName}>
          {bannerElement}
          <EmptyComponent />
        </div>
      );
    }

    const loadPreviousProps: ButtonProps | undefined = onShowPrevious && {
      className: cx(
        'ais-InfiniteHits-loadPrevious',
        classNames.loadPrevious,
        isFirstPage &&
          cx(
            'ais-InfiniteHits-loadPrevious--disabled',
            classNames.disabledLoadPrevious
          )
      ),
      disabled: isFirstPage,
      onClick: onShowPrevious,
    };

    const loadMoreProps: ButtonProps = {
      className: cx(
        'ais-InfiniteHits-loadMore',
        classNames.loadMore,
        isLastPage &&
          cx('ais-InfiniteHits-loadMore--disabled', classNames.disabledLoadMore)
      ),
      disabled: isLastPage,
      onClick: onShowMore,
    };

    return (
      <div {...props} className={rootClassName}>
        {loadPreviousProps &&
          (LoadPreviousComponent ? (
            <LoadPreviousComponent {...loadPreviousProps} />
          ) : (
            <button {...loadPreviousProps}>
              {translations.showPreviousButtonText}
            </button>
          ))}
        {bannerElement}
        <ol className={cx('ais-InfiniteHits-list', classNames.list)}>
          {hits.map((hit, index) => (
            <ItemComponent
              key={hit.objectID}
              hit={hit}
              index={index}
              className={cx('ais-InfiniteHits-item', classNames.item)}
              onClick={() => {
                sendEvent('click:internal', hit, 'Hit Clicked');
              }}
              onAuxClick={() => {
                sendEvent('click:internal', hit, 'Hit Clicked');
              }}
            />
          ))}
        </ol>
        {LoadMoreComponent ? (
          <LoadMoreComponent {...loadMoreProps} />
        ) : (
          <button {...loadMoreProps}>{translations.showMoreButtonText}</button>
        )}
      </div>
    );
  };
}
