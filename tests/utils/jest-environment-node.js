// eslint-disable-next-line import/no-commonjs
const NodeEnvironment = require('jest-environment-node');

class Fixed extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);

    // eslint-disable-next-line no-undef
    this.global.TransformStream = TransformStream;
  }
}

// eslint-disable-next-line import/no-commonjs
module.exports = Fixed;
