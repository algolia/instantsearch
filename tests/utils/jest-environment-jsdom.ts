import { TextDecoder, TextEncoder } from 'util';

import JSDOMEnv from 'jest-environment-jsdom';

import type { Config } from '@jest/types';

type EnvironmentContext = {
  console: Console;
  docblockPragmas: Record<string, string | string[]>;
  testPath: Config.Path;
};

export default class Fixed extends JSDOMEnv {
  constructor(config: Config.ProjectConfig, context?: EnvironmentContext) {
    super(config, context);

    this.global.TransformStream = TransformStream;
    this.global.TextEncoder = TextEncoder;
    this.global.TextDecoder = TextDecoder as typeof global.TextDecoder;
    this.global.ReadableStream = ReadableStream;
    this.global.Response = Response;

    // Preact only maps an `onTransitionEnd` prop to the lowercase
    // `transitionend` event when `ontransitionend` exists on the element,
    // which jsdom omits.
    if (!('ontransitionend' in this.global.HTMLElement.prototype)) {
      Object.defineProperty(
        this.global.HTMLElement.prototype,
        'ontransitionend',
        {
          value: null,
          writable: true,
          configurable: true,
        }
      );
    }
  }

  async setup() {
    await super.setup();
    this.global.jsdom = this.dom;
  }

  async teardown() {
    this.global.jsdom = undefined;
    await super.teardown();
  }
}
