/** @jsx createElement */

import type { Renderer } from '../types';

export type DefaultHitProps<THit> = {
  hit: THit;
};

/**
 * Creates the placeholder used to render a hit when no custom hit
 * component or template is provided. It renders the hit as JSON.
 */
export function createDefaultHitComponent({
  createElement,
  Fragment,
}: Renderer) {
  return function DefaultHit<THit>(userProps: DefaultHitProps<THit>) {
    return <Fragment>{JSON.stringify(userProps.hit, null, 2)}</Fragment>;
  };
}
