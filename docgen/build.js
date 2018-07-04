import builder from './builder';
import {build as middlewares} from './middlewares';

builder({
  middlewares,
}, err => {
  if (err) {
    throw err;
  }
});
