import { Renderer } from '../../types/connector';
import { MemoRenderer } from '../../helpers/memo';

function checkRendering(
  rendering: Renderer | MemoRenderer<void>,
  usage: string
): void {
  if (typeof rendering === 'function' || rendering.$$type === 'ais.memo') {
    return;
  }

  throw new Error(`The render function is not valid (got type "${typeof rendering}").

${usage}`);
}

export default checkRendering;
