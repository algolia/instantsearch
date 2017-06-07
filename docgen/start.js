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
    const isMarkdownFile = filePath.includes('docgen') && /\.md$/.test(filePath)

    const nextMiddlewares = middlewares
      .filter(fn => !isSrcFileChange && fn.name !== 'documentationjs')
      .filter(fn => !isMarkdownFile && fn.name !== 'markdown')
      .filter(fn =>
        !isSassFile && (fn.name === 'bound compileSass' || fn.name === 'sassAutoprefixer')
          ? false
          : true
      )

    builder({clean: false, middlewares: nextMiddlewares}, err => {
      if (err) {
        throw err;
      }
    })
  })
  .on('error', err => {
    throw err;
  });
