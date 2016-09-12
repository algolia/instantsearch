import builder from './builder.js';
import {build as middlewares} from './middlewares';

builder({clean: true, middlewares}, err => {
  if (err) {
    throw err;
  }
});
