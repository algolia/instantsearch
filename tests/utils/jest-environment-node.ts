import NodeEnvironment from 'jest-environment-node';

import type { Config } from '@jest/types';

export default class Fixed extends NodeEnvironment {
  constructor(config: Config.ProjectConfig) {
    super(config);

    this.global.TransformStream = TransformStream;
  }
}
