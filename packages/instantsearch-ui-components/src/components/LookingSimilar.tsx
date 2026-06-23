import { createRecommendComponent } from './recommend-shared';

import type {
  ComponentProps,
  RecommendComponentProps,
  Renderer,
} from '../types';

export type LookingSimilarProps<
  TObject,
  TComponentProps extends Record<string, unknown> = Record<string, unknown>
> = ComponentProps<'div'> & RecommendComponentProps<TObject, TComponentProps>;

export function createLookingSimilarComponent(renderer: Renderer) {
  return createRecommendComponent(renderer, {
    cssClasses: 'ais-LookingSimilar',
    translations: {
      title: 'Looking similar',
      sliderLabel: 'Looking similar',
    },
    displayName: 'LookingSimilar',
  });
}
