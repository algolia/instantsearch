/* eslint-disable no-console */

import metalsmith from 'metalsmith';
import {rootPath} from './path.js';

export default function builder({clean, middlewares}, cb) {
  console.time('metalsmith build');
  // default source directory is join(__dirname, 'src');
  // https://github.com/metalsmith/metalsmith#sourcepath
  metalsmith(__dirname)
    .clean(clean)
    .destination(rootPath('docs/'))
    .use(middlewares)
    .build(err => {
      console.timeEnd('metalsmith build');
      cb(err);
    });
}
