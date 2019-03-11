import { Renderer } from '../../types/connector';

function checkRendering(rendering: Renderer<any>, usage: string) {
  if (rendering === undefined || typeof rendering !== 'function') {
    throw new Error(`The render function is not valid (got type "${typeof rendering}").

${usage}`);
  }
}

export default checkRendering;
