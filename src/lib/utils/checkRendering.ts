import { Renderer } from '../../types/connector';
import getObjectType from './getObjectType';

function checkRendering(rendering: Renderer, usage: string): void {
  if (rendering === undefined || typeof rendering !== 'function') {
    throw new Error(`The render function is not valid (received type ${getObjectType(
      rendering
    )}).

${usage}`);
  }
}

export default checkRendering;
