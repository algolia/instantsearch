import type { Environment } from 'vitest/environments';

export default <Environment>{
  name: 'custom-jsdom',
  transformMode: 'web',
  async setup(global, options) {
    const { builtinEnvironments } = await import('vitest/environments');
    const result = await builtinEnvironments.jsdom.setup(global, options);

    const { TextEncoder, TextDecoder } = await import('util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;

    if (!global.TransformStream) {
      global.TransformStream = TransformStream;
    }
    if (!global.ReadableStream) {
      global.ReadableStream = ReadableStream;
    }
    if (!global.Response) {
      global.Response = Response;
    }

    return result;
  },
};
