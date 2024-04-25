/** @jsx createElement */

import type { Renderer } from '../../types';

export function createDefaultFallbackComponent({
  createElement,
  Fragment,
}: Renderer) {
  return function DefaultFallback() {
    return <Fragment>No results</Fragment>;
  };
}
