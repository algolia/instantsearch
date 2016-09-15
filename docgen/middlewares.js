import layouts from 'metalsmith-layouts';
import headings from 'metalsmith-headings';
import navigation from 'metalsmith-navigation';
import markdown from 'metalsmith-markdown';

import inlineProps from './plugins/inlineProps/index.js';
import renderer from './mdRenderer.js';
import source from './plugins/source.js';
import onlyChanged from './plugins/onlyChanged.js';
import assets from './plugins/assets.js';
import ignore from './plugins/ignore.js';
import helpers from './plugins/helpers.js';
import webpackEntryMetadata from './plugins/webpackEntryMetadata.js';
import webpackStartConfig from './webpack.config.start.babel.js';
import webpackBuildConfig from './webpack.config.build.babel';
import msWebpack from 'ms-webpack';
// performance and debug info for metalsmith, when needed see usage below
// import {start as perfStart, stop as perfStop} from './plugins/perf.js';

import {reactPackage} from './path.js';

// let's add all the source files from packages/react-instantsearch/widgets/**/*.md
const reactReadmes = source(reactPackage('src'), reactPackage('src/widgets/**/*.md'), (name, file) =>
  [
    name.replace(/widgets\/(.*)\/README\.md/, '$1.md'),
    {
      ...file,
      path: reactPackage('src', name),
    },
  ]
);

const common = [
  helpers,
  reactReadmes,
  assets({
    source: './assets/',
    destination: './assets/',
  }),
  ignore(fileName => {
    // if it's a build js file, keep it (`build`)
    if (/-build\.js$/.test(fileName)) {
      return false;
    }

    // if it's a non js build file, skip it (`start` and `build`)
    if (/assets\/js\/(.*)?\.js$/.test(fileName)) {
      return true;
    }

    return false;
  }),
  markdown({
    renderer,
  }),
  // After markdown, so that paths point to the correct HTML file
  navigation({
    core: {
      sortBy: 'nav_sort',
      filterProperty: 'nav_groups',
    },
    widgets: {
      sortBy: 'nav_sort',
      filterProperty: 'nav_groups',
    },
    examples: {
      sortBy: 'nav_sort',
      filterProperty: 'nav_groups',
    },
  }, {
    navListProperty: 'navs',
  }),
  onlyChanged,

  // perfStart(),
  inlineProps,
  // perfStop(),
  headings('h2, h3'),
  layouts('pug'),
];

// development mode
export const start = [
  webpackEntryMetadata(webpackStartConfig),
  ...common,
];

export const build = [
  msWebpack({
    ...webpackBuildConfig,
    stats: {
      chunks: false,
      modules: false,
      chunkModules: false,
      reasons: false,
      cached: false,
      cachedAssets: false,
    },
  }),
  ...common,
];
