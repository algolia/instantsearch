/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { connectHits } from 'instantsearch.js/es/connectors';
import { h, render } from 'preact';

import type { Banner } from 'algoliasearch-helper';
import type {
  ComponentProps,
  HitsClassNames,
} from 'instantsearch-ui-components';
import type { HitsConnectorParams } from 'instantsearch.js/es/connectors/hits/connectHits';

export type BannerWidgetParams = {
  container: HTMLElement;
  classNames?: BannerClassNames;
};

type BannerClassNames = Pick<
  Partial<HitsClassNames>,
  'bannerRoot' | 'bannerLink' | 'bannerImage'
>;

type BannerProps = ComponentProps<'aside'> & {
  banner?: Banner;
  classNames: BannerClassNames;
};

function DefaultBanner(props: BannerProps) {
  if (!props.banner || !props.banner.image) {
    return null;
  }
  if (!props.banner.image.urls[0].url) {
    return null;
  }
  return (
    <aside className={cx('ais-Hits-banner', props.classNames.bannerRoot)}>
      {props.banner.link ? (
        <a
          className={cx('ais-Hits-banner-link', props.classNames.bannerLink)}
          href={props.banner.link.url}
          target={props.banner.link.target}
        >
          <img
            className={cx(
              'ais-Hits-banner-image',
              props.classNames.bannerImage
            )}
            src={props.banner.image.urls[0].url}
            alt={props.banner.image.title}
          />
        </a>
      ) : (
        <img
          className={cx('ais-Hits-banner-image', props.classNames.bannerImage)}
          src={props.banner.image.urls[0].url}
          alt={props.banner.image.title}
        />
      )}
    </aside>
  );
}

function renderer({
  container,
  classNames,
}: {
  container: HTMLElement;
  classNames: BannerClassNames;
}) {
  return (props: { banner?: Banner }) =>
    render(
      <DefaultBanner banner={props.banner} classNames={classNames} />,
      container
    );
}

export function banner(widgetParams: BannerWidgetParams & HitsConnectorParams) {
  const { container, classNames = {} } = widgetParams || {};

  if (!container) {
    throw new Error('The `container` option is required.');
  }

  const specializedRenderer = renderer({
    container,
    classNames,
  });

  const makeWidget = connectHits(specializedRenderer, () =>
    render(null, container)
  );

  return {
    $$widgetType: 'ais.experiences-banner',
    ...makeWidget({}),
  };
}
