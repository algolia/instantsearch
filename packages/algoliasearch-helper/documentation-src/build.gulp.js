'use strict';
var path = require('path');
var http = require('http');
var forEach = require('lodash/forEach');

var metalsmith = require('metalsmith');
var gulp = require('gulp');

var inPlace = require('metalsmith-in-place');
var markdown = require('metalsmith-markdown');
var jsdoc = require('./metalsmith/plugins/jsdoc-data.js');
var registerHandleBarHelpers = require('./metalsmith/plugins/handlebars-helpers.js');
var layouts = require('metalsmith-layouts');
var headings = require('metalsmith-headings');
var metallic = require('metalsmith-metallic');

var marked = require('marked');
var sass = require('gulp-sass');
var livereload = require('gulp-livereload');
var webpack = require('webpack-stream');

var st = require('st');

var a = require('algolia-frontend-components');

var webpackConfig = require('./webpack.config.js');

var src = {
  stylesheets: path.join(__dirname, './metalsmith/stylesheets/**/*.scss'),
  content: path.join(__dirname, './metalsmith/content'),
  layouts: path.join(__dirname, './metalsmith/layouts'),
  partials: path.join(__dirname, './metalsmith/partials'),
  js: path.join(__dirname, './metalsmith/js/')
};

var projectRoot = path.join(__dirname, '..');
var documentationRoot = path.join(projectRoot, 'documentation');
var jsRoot = path.join(documentationRoot, 'js');
var cssRoot = path.join(documentationRoot, 'css');

var customMarkedRenderer = new marked.Renderer();
var oldHeadingRenderer = customMarkedRenderer.heading;
customMarkedRenderer.heading = function(text, level) {
  if (level > 3) {
    return '<h' + level + '>' + text + '</h' + level + '>';
  }
  return oldHeadingRenderer.apply(this, arguments);
};

var header = a.communityHeader({
  menu:{
    project: {
      label: "algoliasearch-helper",
      url: "https://community.algolia.com/algoliasearch-helper-js/"
    }
  },
  sideMenu: [
    { name: "Getting started", dropdownItems: null, url: "gettingstarted.html" },
    { name: "Concepts", url: "concepts.html" },
    { name: "Reference", url: "reference.html" },
    { name: "Examples", url: "examples.html"}
  ],
  mobileMenu: [
    { name: "Getting started", url: "gettingstarted.html" },
    { name: "Concepts", url: "concepts.html" },
    { name: "Reference", url: "reference.html" },
    { name: "Examples", url: "examples.html"}
  ],
  docSearch: null
});

function makeMetalsmithBuilder() {
  var project = require('../package.json');
  var builder = metalsmith(projectRoot);
  return builder.metadata({
      pkg: project,
      header: header
    })
    .ignore('.*')
    .clean(false)
    .source(src.content)
    .destination(documentationRoot)
    .use(jsdoc({
      src: 'src/algoliasearch.helper.js',
      namespace: 'helper'
    }))
    .use(jsdoc({
      src: 'src/SearchResults/index.js',
      namespace: 'results'
    }))
    .use(jsdoc({
      src: 'src/SearchParameters/index.js',
      namespace: 'state'
    }))
    .use(jsdoc({
      src: 'src/url.js',
      namespace: 'url'
    }))
    .use(jsdoc({
      src: 'index.js',
      namespace: 'main'
    }))
    .use(inPlace({
      engine: 'handlebars',
      partials: 'documentation-src/metalsmith/partials',
      exposeConsolidate: registerHandleBarHelpers
    }))
    .use(metallic())
    .use(markdown({
      gfm: true,
      renderer: customMarkedRenderer
    }))
    .use(headings('h2, h3'))
    .use(layouts({
      engine: 'jade',
      directory: src.layouts
    }));
}
gulp.task('doc:content', function(cb) {
  makeMetalsmithBuilder().build(function(err) {
    cb(err);
  });
});

gulp.task('doc:content:watch', function(cb) {
  makeMetalsmithBuilder().build(function(err, data) {
    forEach(data, (o, filename) => {
      if (filename !== 'metalsmith-changed-ctimes.json') {
        livereload.changed(filename);
      }
    });
    cb(err);
  });
});

function gulpStyle() {
  return gulp.src(src.stylesheets)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(cssRoot));
}
gulp.task('doc:style', gulpStyle);
gulp.task('doc:style:watch', function() {
  return gulpStyle().pipe(livereload());
});

gulp.task('doc:js', function() {
  return gulp.src(src.js + 'main.js')
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(jsRoot));
});

gulp.task('doc:js:watch', function() {
  var configWithWatch = Object.assign({}, webpackConfig, {
    // watch: true,
    devtool: 'eval-source-map'
  });
  return gulp.src(src.js + 'main.js')
    .pipe(webpack(configWithWatch))
    .pipe(gulp.dest(jsRoot))
    .pipe(livereload());
});

gulp.task('doc:all:watch', ['doc:content', 'doc:js', 'doc:style'], function() {
  livereload.listen();
  gulp.watch(src.stylesheets, ['doc:style:watch']);
  gulp.watch(src.content + '/**/*.md', ['doc:content:watch']);
  gulp.watch(src.partials + '/**/*.hbs', ['doc:content:watch']);
  gulp.watch(src.layouts + '/**/*.jade', ['doc:content:watch']);
  gulp.watch(src.content + '/**/*.md', ['doc:content:watch']);
  gulp.watch('../src/**/*.js', ['doc:content:watch']);
  gulp.watch(src.js + '**/*.js', ['doc:js:watch']);
});

gulp.task('doc:server', function(done) {
  http.createServer(
    st({ path: documentationRoot, index: 'index.html', cache: false })
  ).listen(8083, done);
});

gulp.task('doc:watch', ['doc:content', 'doc:js', 'doc:style', 'doc:server', 'doc:all:watch'], function() {

  console.log(" >>>> Go to http://localhost:8083 🚀");
});
gulp.task('doc', ['doc:content', 'doc:style', 'doc:js']);
