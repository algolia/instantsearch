/** @jsx createElement */

import type { RecommendInnerComponentProps, Renderer } from '../../types';

export function createDefaultHeaderComponent({ createElement }: Renderer) {
  return function DefaultHeader<TObject>(
    userProps: RecommendInnerComponentProps<TObject>
  ) {
    const { classNames = {}, items, translations } = userProps;

    if (!items || items.length < 1) {
      return null;
    }

    if (!translations.title) {
      return null;
    }

    return <h3 className={classNames.title}>{translations.title}</h3>;
  };
}
