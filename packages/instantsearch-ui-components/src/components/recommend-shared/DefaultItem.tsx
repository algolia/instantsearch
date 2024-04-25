/** @jsx createElement */

import type { RecommendItemComponentProps, Renderer } from '../../types';

export function createDefaultItemComponent({
  createElement,
  Fragment,
}: Renderer) {
  return function DefaultItem<TObject>(
    userProps: RecommendItemComponentProps<TObject>
  ) {
    return <Fragment>{JSON.stringify(userProps.item, null, 2)}</Fragment>;
  };
}
