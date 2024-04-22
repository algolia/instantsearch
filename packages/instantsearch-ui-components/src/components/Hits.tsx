/** @jsx createElement */
import { cx } from '../lib';

import type { ComponentProps, Renderer } from '../types';

// Should be imported from a shared package in the future
type Hit = Record<string, unknown> & {
  objectID: string;
};
type SendEventForHits = (...props: unknown[]) => void;
type Banner = {
  image: {
    urls: Array<{
      url: string;
    }>;
    title?: string;
  };
  link?: {
    url?: string;
    target?: '_blank' | '_self';
  };
};

type BannerProps = ComponentProps<'aside'> & {
  banner: Banner;
  classNames: Pick<
    Partial<HitsClassNames>,
    'bannerRoot' | 'bannerLink' | 'bannerImage'
  >;
};

function createDefaultBannerComponent({ createElement }: Renderer) {
  return function DefaultBanner({ classNames, banner }: BannerProps) {
    if (!banner.image.urls[0].url) {
      return null;
    }
    return (
      <aside className={cx('ais-Hits-banner', classNames.bannerRoot)}>
        {banner.link?.url ? (
          <a
            className={cx('ais-Hits-banner-link', classNames.bannerLink)}
            href={banner.link.url}
            target={banner.link.target}
          >
            <img
              className={cx('ais-Hits-banner-image', classNames.bannerImage)}
              src={banner.image.urls[0].url}
              alt={banner.image.title}
            />
          </a>
        ) : (
          <img
            className={cx('ais-Hits-banner-image', classNames.bannerImage)}
            src={banner.image.urls[0].url}
            alt={banner.image.title}
          />
        )}
      </aside>
    );
  };
}

export type HitsProps<THit> = ComponentProps<'div'> & {
  hits: THit[];
  itemComponent: (props: {
    hit: THit;
    index: number;
    className: string;
    onClick: () => void;
    onAuxClick: () => void;
  }) => JSX.Element;
  sendEvent: SendEventForHits;
  classNames?: Partial<HitsClassNames>;
  emptyComponent?: (props: { className?: string }) => JSX.Element;
  banner?: Banner;
  bannerComponent?: (props: {
    className: string;
    banner: Banner;
  }) => JSX.Element;
};

export type HitsClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the root element without results
   */
  emptyRoot: string | string[];
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

export function createHitsComponent({ createElement, Fragment }: Renderer) {
  const DefaultBannerComponent = createDefaultBannerComponent({
    createElement,
    Fragment,
  });

  return function Hits<THit extends Hit>(userProps: HitsProps<THit>) {
    const {
      classNames = {},
      hits,
      itemComponent: ItemComponent,
      sendEvent,
      emptyComponent: EmptyComponent,
      banner,
      bannerComponent: BannerComponent,
      ...props
    } = userProps;

    return (
      <div
        {...props}
        className={cx(
          'ais-Hits',
          classNames.root,
          hits.length === 0 && cx('ais-Hits--empty', classNames.emptyRoot),
          props.className
        )}
      >
        {banner &&
          (BannerComponent ? (
            <BannerComponent
              className={cx('ais-Hits-banner', classNames.bannerRoot)}
              banner={banner}
            />
          ) : (
            <DefaultBannerComponent classNames={classNames} banner={banner} />
          ))}
        {hits.length === 0 && EmptyComponent ? (
          <EmptyComponent />
        ) : (
          <ol className={cx('ais-Hits-list', classNames.list)}>
            {hits.map((hit, index) => (
              <ItemComponent
                key={hit.objectID}
                hit={hit}
                index={index}
                className={cx('ais-Hits-item', classNames.item)}
                onClick={() => {
                  sendEvent('click:internal', hit, 'Hit Clicked');
                }}
                onAuxClick={() => {
                  sendEvent('click:internal', hit, 'Hit Clicked');
                }}
              />
            ))}
          </ol>
        )}
      </div>
    );
  };
}
