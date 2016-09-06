/* eslint-disable no-console */

import metalsmith from 'metalsmith';
import assets from 'metalsmith-assets';
import layouts from 'metalsmith-layouts';
import headings from 'metalsmith-headings';
import navigation from 'metalsmith-navigation';
import markdown from 'metalsmith-markdown';
import watch from 'metalsmith-watch';
import serve from 'metalsmith-serve';
import {join} from 'path';

import renderer from './renderer';
import inlineProps from './inlinePropsPlugin';
import source from './sourcePlugin';

import webpackPlugin from 'ms-webpack';
import webpackConfiguration from './webpack.config.babel.js';

const root = (...args) => join(__dirname, '..', ...args);
const reactPackage = (...args) => root('packages/react-instantsearch/', ...args);

// default source directory is join(__dirname, 'src');
// https://github.com/metalsmith/metalsmith#sourcepath
metalsmith(__dirname)
  .ignore('assets')
  .use(webpackPlugin(webpackConfiguration))
  // let's add all the source files from packages/react-instantsearch/widgets/**/*.md
  .use(
    source(reactPackage('src'), reactPackage('src/widgets/**/*.md'), (name, file) =>
      [
        name.replace(/widgets\/(.*)\/README\.md/, '$1.md'),
        {
          ...file,
          path: reactPackage('src', name),
        },
      ]
    )
  )
  .use(inlineProps)
  .metadata({
    // If env is undefined, it won't get passed to the templates.
    env: process.env.NODE_ENV || '',
  })
  .use(watch({
    livereload: true,
    paths: {
      // eslint-disable-next-line no-template-curly-in-string
      '${source}/**/*': true,
      'assets/**/*': '**/*',
      'layouts/**/*': '**/*',
    },
  }))
  .use(assets({
    source: './assets',
    destination: './assets',
  }))
  .use(markdown({
    renderer,
  }))
  // After markdown, so that paths point to the correct HTML file
  .use(navigation({
    core: {
      sortBy: 'nav_sort',
      filterProperty: 'nav_groups',
    },
    widgets: {
      sortBy: 'nav_sort',
      filterProperty: 'nav_groups',
    },
  }, {
    navListProperty: 'navs',
  }))
  // Consider h2 and h3 elements (##, ###) as headers
  .use(headings('h2, h3'))
  .use(layouts('ejs'))
  .use(serve({
    gzip: true,
    cache: false,
  }))
  .destination(root('docs/'))
  .build(err => {
    if (err) {
      throw err;
    }
  });
