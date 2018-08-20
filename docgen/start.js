import {watch} from 'chokidar';

import devServer from './devServer';
import builder from './builder';
import {start as middlewares} from './middlewares';
import {rootPath} from './path';

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
  rootPath('docgen/assets/'),
  rootPath('docgen/src/**/*'),
  rootPath('docgen/layouts/**/*.pug'),
  rootPath('src/**/*.js'),
], {
  ignoreInitial: true,
  ignored: /assets\/js\/(.*)?\.js$/,
})
  .on('all', (event, filePath) => {
    // filter out plugins we dont need on some files changes
    // example: remove `documentationjs` when no src/ files changed.
    const isSrcFileChange = filePath.includes('src/') && !filePath.includes('docgen')
    const isSassFile = filePath.includes('docgen') && /^[^_.].*\.s[ac]ss/.test(filePath)
    const isMarkdownOrPugFile = filePath.includes('docgen') && /\.md$|\.pug$/.test(filePath)

    const nextMiddlewares = middlewares
      .filter(fn => isSrcFileChange || fn.name !== 'documentationjs')
      .filter(fn => isMarkdownOrPugFile || fn.name !== 'markdown')
      .filter(fn => isSassFile || fn.name !== 'bound compileSass')
      .filter(fn => isSassFile || fn.name !== 'sassAutoprefixer')

    builder({clean: false, middlewares: nextMiddlewares}, err => {
      if (err) {
        if (err.message.includes('[metalsmith-sass] Error: Invalid CSS')) {
          console.warn(err.message);
        } else {
          throw err;
        }
      }
    })
  })
  .on('error', err => {
    throw err;
  });
