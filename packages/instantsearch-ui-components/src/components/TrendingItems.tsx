import { createRecommendComponent } from './recommend-shared';

import type {
  ComponentProps,
  RecommendComponentProps,
  Renderer,
} from '../types';

export type TrendingItemsProps<
  TObject,
  TComponentProps extends Record<string, unknown> = Record<string, unknown>
> = ComponentProps<'div'> & RecommendComponentProps<TObject, TComponentProps>;

export function createTrendingItemsComponent(renderer: Renderer) {
  return createRecommendComponent(renderer, {
    cssClasses: 'ais-TrendingItems',
    translations: {
      title: 'Trending items',
      sliderLabel: 'Trending items',
    },
    displayName: 'TrendingItems',
  });
}
