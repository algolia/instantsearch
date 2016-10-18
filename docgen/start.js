import {watch} from 'chokidar';

import devServer from './devServer.js';
import builder from './builder.js';
import {start as middlewares} from './middlewares';
import {rootPath} from './path.js';

// we build once at start
builder({middlewares}, err => {
  if (err) {
    throw err;
  }

  // watch and serve docs/ (browser sync)
  devServer();
});

// then we watch and rebuild
watch([
  rootPath('packages/react-instantsearch/src/**/*.js'),
  rootPath('docgen/assets/'),
  rootPath('docgen/src/**/*'),
  rootPath('docgen/layouts/**/*.pug'),
  rootPath('packages/react-instantsearch/src/**/*.md'),
], {
  ignoreInitial: true,
  ignored: /assets\/js\/(.*)?\.js$/,
})
  .on('all', () => builder({clean: false, middlewares}, err => {
    if (err) {
      throw err;
    }
  }))
  .on('error', err => {
    throw err;
  });
