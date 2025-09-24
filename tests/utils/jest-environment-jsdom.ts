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
  }
}
