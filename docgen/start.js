import { watch } from 'chokidar';
import devServer from './devServer';
import builder from './builder';
import { start as middlewares } from './middlewares';
import { rootPath } from './path';

// we build once at start
builder({ middlewares }, err => {
  if (err) {
    throw err;
  }

  // watch and serve docs/ (browser sync)
  devServer();
});

// then we watch and rebuild
watch(
  [
    rootPath('packages/*/src/**/*.js'),
    rootPath('docgen/assets/'),
    rootPath('docgen/src/**/*'),
    rootPath('docgen/layouts/**/*.pug'),
  ],
  {
    ignoreInitial: true,
    ignored: /assets\/js\/(.*)?\.js$/,
  }
)
  .on('all', () =>
    builder({ clean: false, middlewares }, err => {
      if (err) {
        throw err;
      }
    })
  )
  .on('error', err => {
    throw err;
  });
