/* eslint-disable no-console */

import metalsmith from 'metalsmith';
import assets from 'metalsmith-assets';
import layouts from 'metalsmith-layouts';
import headings from 'metalsmith-headings';
import navigation from 'metalsmith-navigation';
import markdown from 'metalsmith-markdown';
import watch from 'metalsmith-watch';
import serve from 'metalsmith-serve';
import {resolve} from 'path';

import renderer from './renderer';
import inlineProps from './inlinePropsPlugin';
import source from './sourcePlugin';

const r = resolve.bind(null, __dirname);

metalsmith(__dirname)
  .use(
    source(r('../src'), r('../src/widgets/**/*.md'), (name, file) =>
      [
        name.replace(/widgets\/(.*)\/README\.md/, '$1.md'),
        {
          ...file,
          path: r('../src', name),
        },
      ]
    )
  )
  .use(inlineProps)
  // .use(addProps())
  .metadata({
    // If env is undefined, it won't get passed to the templates.
    env: process.env.NODE_ENV || '',
  })
  .use(watch({
    livereload: true,
    paths: {
      '${source}/**/*': true,
      'assets/**/*': true,
      'layouts/**/*': true,
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
  .use(serve())
  .destination(r('../docs'))
  .build(err => {
    if (err) {
      throw err;
    }
  });
