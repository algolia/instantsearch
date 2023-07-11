'use strict';
var path = require('path');

var metalsmith = require('metalsmith');
var inPlace = require('metalsmith-in-place');
var markdown = require('metalsmith-markdown');
var jsdoc = require('./plugins/jsdoc-data');
var registerHandleBarHelpers = require('./plugins/handlebars-helpers');
var headings = require('./plugins/headings');
var layouts = require('metalsmith-layouts');
var metallic = require('metalsmith-metallic');
var sass = require('@metalsmith/sass');
var marked = require('marked');

var isDev = process.env.NODE_ENV === 'development';

var projectRoot = path.join(__dirname, '..');
var documentationRoot = path.join(
  projectRoot,
  '../../website/algoliasearch-helper-js/'
);
var cssRoot = path.join(documentationRoot, 'css');

var src = {
  stylesheets: path.join(__dirname, './stylesheets'),
  content: path.join(__dirname, './content'),
  layouts: path.join(__dirname, './layouts'),
  partials: path.join(__dirname, './partials'),
  js: path.join(__dirname, './js/'),
};

var customMarkedRenderer = new marked.Renderer();
var oldHeadingRenderer = customMarkedRenderer.heading;
customMarkedRenderer.heading = function (text, level) {
  // do not add id to h4+
  if (level > 3) {
    return '<h' + level + '>' + text + '</h' + level + '>';
  }
  return oldHeadingRenderer.apply(this, arguments);
};

var project = require('../package.json');
var builder = metalsmith(projectRoot)
  .metadata({
    pkg: project,
  })
  .ignore('.*')
  .clean(false)
  .source(src.content)
  .destination(documentationRoot)
  .use(
    sass({
      style: isDev ? 'expanded' : 'compressed',
      sourceMap: isDev,
      sourceMapIncludeSources: isDev,
      loadPaths: ['node_modules'],
      entries: {
        [path.join(src.stylesheets, 'index.scss')]: path.join(
          cssRoot,
          'index.css'
        ),
      },
    })
  )
  .use(
    jsdoc({
      src: 'src/algoliasearch.helper.js',
      namespace: 'helper',
    })
  )
  .use(
    jsdoc({
      src: 'src/SearchResults/index.js',
      namespace: 'results',
    })
  )
  .use(
    jsdoc({
      src: 'src/SearchParameters/index.js',
      namespace: 'state',
    })
  )
  .use(
    jsdoc({
      src: 'index.js',
      namespace: 'main',
    })
  )
  .use(
    inPlace({
      engine: 'handlebars',
      partials: 'documentation-src/partials',
      exposeConsolidate: registerHandleBarHelpers,
    })
  )
  .use(metallic())
  .use(
    markdown({
      gfm: true,
      renderer: customMarkedRenderer,
    })
  )
  .use(headings('h2, h3'))
  .use(
    layouts({
      engine: 'pug',
      directory: src.layouts,
    })
  );

builder.build(function (err) {
  if (err) {
    throw err;
  }
  console.log('Metalsmith build finished');
});
