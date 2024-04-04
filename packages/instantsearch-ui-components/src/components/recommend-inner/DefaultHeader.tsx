/** @jsx createElement */
import { cx } from '../../lib';

import type { InnerComponentProps, Renderer } from '../../types';

export function createDefaultHeaderComponent({ createElement }: Renderer) {
  return function DefaultHeader<TObject>(
    userProps: InnerComponentProps<TObject>
  ) {
    const { classNames = {}, recommendations, translations } = userProps;

    if (!recommendations || recommendations.length < 1) {
      return null;
    }

    if (!translations.title) {
      return null;
    }

    return (
      <h3 className={cx('ais-Recommend-title', classNames.title)}>
        {translations.title}
      </h3>
    );
  };
}
