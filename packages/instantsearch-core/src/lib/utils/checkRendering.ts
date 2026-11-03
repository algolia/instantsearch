import { getObjectType } from './getObjectType';

import type { Renderer } from '../../types/connector';

export function checkRendering(
  rendering: any,
  usage: string
): asserts rendering is Renderer<any, any> {
  if (rendering === undefined || typeof rendering !== 'function') {
    throw new Error(`The render function is not valid (received type ${getObjectType(
      rendering
    )}).

${usage}`);
  }
}
