/** @jsx createElement */

import type { RecommendInnerComponentProps, Renderer } from '../../types';

export function createDefaultHeaderComponent({ createElement }: Renderer) {
  return function DefaultHeader<TObject>(
    userProps: RecommendInnerComponentProps<TObject>
  ) {
    const { classNames = {}, recommendations, translations } = userProps;

    if (!recommendations || recommendations.length < 1) {
      return null;
    }

    if (!translations.title) {
      return null;
    }

    return <h3 className={classNames.title}>{translations.title}</h3>;
  };
}
