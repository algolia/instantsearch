import type { Renderer } from '../../types/connector';
import { getObjectType } from './getObjectType';

export function checkRendering<TRenderOptions, TWidgetParams>(
  rendering: Renderer<TRenderOptions, TWidgetParams>,
  usage: string
): void {
  if (rendering === undefined || typeof rendering !== 'function') {
    throw new Error(`The render function is not valid (received type ${getObjectType(
      rendering
    )}).

${usage}`);
  }
}
