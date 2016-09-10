/* eslint-disable no-console */

import metalsmith from 'metalsmith';
import layouts from 'metalsmith-layouts';
import headings from 'metalsmith-headings';
import navigation from 'metalsmith-navigation';
import markdown from 'metalsmith-markdown';
import {watch} from 'chokidar';

import inlineProps from './plugins/inlineProps/index.js';
import renderer from './mdRenderer.js';
import source from './plugins/source.js';
import onlyChanged from './plugins/onlyChanged.js';
import assets from './plugins/assets.js';
import ignore from './plugins/ignore.js';
import devServer from './devServer.js';
import {root, reactPackage} from './path.js';

// default source directory is join(__dirname, 'src');
// https://github.com/metalsmith/metalsmith#sourcepath
const build = (clean, cb) => {
  console.time('metalsmith build');
  metalsmith(__dirname)
    .clean(clean)
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
    .use(assets({
      source: './assets/',
      destination: './assets/',
    }))
    .use(ignore(/assets\/js\/(.*)?\.js$/))
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
    .use(onlyChanged)
    // .use((files, m, done) => {
    //   // debug
    //   console.log(Object.keys(files));
    //   done(null);
    // })
    .use(inlineProps)
    .metadata({
      // If env is undefined, it won't get passed to the templates.
      env: process.env.NODE_ENV || '',
    })
    // Consider h2 and h3 elements (##, ###) as headers
    .use(headings('h2, h3'))
    .use(layouts('ejs'))
    .destination(root('docs/'))
    .build(err => {
      console.timeEnd('metalsmith build');
      cb(err);
    });
};

// now let's watch for relevant file changes and rebuild files
watch([
  root('docgen/assets/'),
  root('docgen/src/'),
  root('docgen/layouts/'),
  root('packages/react-instantsearch/src/**/*.md'),
], {
  ignoreInitial: true,
  ignored: /assets\/js\/(.*)?\.js$/,
})
  .on('all', () => build(false, err => {
    if (err) {
      throw err;
    }
  }))
  .on('error', err => {
    throw err;
  });

// we build once at start
build(true, err => {
  if (err) {
    throw err;
  }

  devServer();
});
