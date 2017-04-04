import builder from './builder.js';
import revAssets from './plugins/rev-assets.js';
import { build as middlewares } from './middlewares';

builder(
  {
    middlewares,
  },
  err => {
    if (err) {
      throw err;
    }

    revAssets();
  }
);
