import headings from 'metalsmith-headings';
import layouts from 'metalsmith-layouts';
import msWebpack from 'ms-webpack';
import navigation from 'metalsmith-navigation';
import sass from 'metalsmith-sass';
import nav from './plugins/navigation';
import assets from './plugins/assets';
import helpers from './plugins/helpers';
import ignore from './plugins/ignore';
import jsdoc from './plugins/jsdoc-data';
import markdown from './plugins/markdown';
import onlyChanged from './plugins/onlyChanged';
import webpackEntryMetadata from './plugins/webpackEntryMetadata';
import autoprefixer from './plugins/autoprefixer';
import sources from './plugins/sources';

// performance and debug info for metalsmith, when needed see usage below
// import {start as perfStart, stop as perfStop} from './plugins/perf';

import webpackStartConfig from './webpack.config.start.babel';
import webpackBuildConfig from './webpack.config.build.babel';
import { corePackage, domPackage } from './path';

const common = [
  helpers,
  assets({
    source: './assets/',
    destination: './assets/',
  }),
  assets({
    source: './rootFiles',
    destination: './',
  }),
  sources(
    [
      corePackage('src/components/InstantSearch.js'),
      corePackage('src/components/Index.js'),
      corePackage('src/connectors/*.js'),
      corePackage('src/widgets/*.js'),
      domPackage('src/widgets/*.js'),
      domPackage('src/core/findResultsState.js'),
    ],
    {
      ignore: '**/*.test.js',
      computeFilename: filename => `${filename}.jsdoc`, // denotes jsdoc file but also avoid js ignore
    }
  ),
  ignore(fileName => {
    // This is a fix for VIM swp files inside src/,
    // We could also configure VIM to store swp files somewhere else
    // http://stackoverflow.com/questions/1636297/how-to-change-the-folder-path-for-swp-files-in-vim
    if (/\.swp$/.test(fileName)) return true;

    // if it's a build js file, keep it (`build`)
    if (/-build\.js$/.test(fileName)) return false;

    // if it's any other JavaScript file, ignore it, it's handled by build files above
    if (/\.js$/.test(fileName)) return true;

    // ignore scss partials, only include scss entrypoints
    if (/_.*\.s[ac]ss/.test(fileName)) return true;

    // otherwise, keep file
    return false;
  }),
  markdown,
  jsdoc(),
  headings('h2'),
  nav(),
  // After markdown, so that paths point to the correct HTML file
  navigation(
    {
      core: {
        sortBy: 'nav_sort',
        filterProperty: 'nav_groups',
      },
      widget: {
        sortBy: 'nav_sort',
        filterProperty: 'nav_groups',
      },
      connector: {
        sortBy: 'nav_sort',
        filterProperty: 'nav_groups',
      },
      examples: {
        sortBy: 'nav_sort',
        filterProperty: 'nav_groups',
      },
      gettingstarted: {
        sortBy: 'nav_sort',
        filterProperty: 'nav_groups',
      },
    },
    {
      navListProperty: 'navs',
    }
  ),
  // perfStart(),
  sass({
    sourceMap: true,
    sourceMapContents: true,
    outputStyle: 'nested',
    includePaths: ['../', './'],
  }),
  // since we use @import, autoprefixer is used after sass
  autoprefixer,
  // perfStop(),
];

// development mode
export const start = [
  webpackEntryMetadata(webpackStartConfig),
  ...common,
  onlyChanged,
  layouts('pug'),
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
  layouts('pug'),
];
