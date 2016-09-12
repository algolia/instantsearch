import builder from './builder.js';
import {build as middlewares} from './middlewares';

builder({
  middlewares,
  destination: process.env.DOCS_DESTINATION,
}, err => {
  if (err) {
    throw err;
  }
});
