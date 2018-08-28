import builder from './builder';
import revAssets from './plugins/rev-assets';
import { build as middlewares } from './middlewares';

builder({ middlewares }, err => {
  if (err) {
    throw err;
  }

  revAssets();
});
