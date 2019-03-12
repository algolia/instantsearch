function checkRendering(rendering: () => void, usage: string) {
  if (rendering === undefined || typeof rendering !== 'function') {
    throw new Error(`The render function is not valid (got type "${typeof rendering}").

${usage}`);
  }
}

export default checkRendering;
