import { createRecommendComponent } from './recommend-shared';

import type {
  ComponentProps,
  RecommendComponentProps,
  Renderer,
} from '../types';

export type RelatedProductsProps<
  TObject,
  TComponentProps extends Record<string, unknown> = Record<string, unknown>
> = ComponentProps<'div'> & RecommendComponentProps<TObject, TComponentProps>;

export function createRelatedProductsComponent(renderer: Renderer) {
  return createRecommendComponent(renderer, {
    cssClasses: 'ais-RelatedProducts',
    translations: {
      title: 'Related products',
      sliderLabel: 'Related products',
    },
    displayName: 'RelatedProducts',
  });
}
