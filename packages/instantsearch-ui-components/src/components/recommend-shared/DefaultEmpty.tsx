/** @jsx createElement */

import type { Renderer } from '../../types';

export function createDefaultEmptyComponent({
  createElement,
  Fragment,
}: Renderer) {
  return function DefaultEmpty() {
    return <Fragment>No results</Fragment>;
  };
}
