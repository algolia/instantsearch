import { createRecommendComponent } from './recommend-shared';

import type {
  ComponentProps,
  RecommendComponentProps,
  Renderer,
} from '../types';

export type FrequentlyBoughtTogetherProps<
  TObject,
  TComponentProps extends Record<string, unknown> = Record<string, unknown>
> = ComponentProps<'div'> & RecommendComponentProps<TObject, TComponentProps>;

export function createFrequentlyBoughtTogetherComponent(renderer: Renderer) {
  return createRecommendComponent(renderer, {
    cssClasses: 'ais-FrequentlyBoughtTogether',
    translations: {
      title: 'Frequently bought together',
      sliderLabel: 'Frequently bought together products',
    },
    displayName: 'FrequentlyBoughtTogether',
  });
}
