import builder from './builder.js';
import {build as middlewares} from './middlewares';

builder({
  middlewares,
  destination: process.env.DOCS_DIST,
}, err => {
  if (err) {
    throw err;
  }
});
