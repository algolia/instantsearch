import builder from './builder.js';
import {build as middlewares} from './middlewares';

builder({
  middlewares,
}, err => {
  if (err) {
    throw err;
  }
});
