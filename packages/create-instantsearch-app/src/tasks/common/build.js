const inPlace = require('@metalsmith/in-place');
const remove = require('@metalsmith/remove');
const metalsmith = require('metalsmith');
const rename = require('metalsmith-rename');

module.exports = function build(config) {
  return new Promise((resolve, reject) => {
    metalsmith(__dirname)
      .source(config.template)
      .destination(config.path)
      .metadata(config)
      .use(remove(['.template.js']))
      .use(
        // Add the `.hbs` extension to any templating files that need
        // their placeholders to get filled with `metalsmith-in-place`
        rename([
          // `npx` renames `.gitignore` files to `.npmignore`
          // See https://github.com/algolia/create-instantsearch-app/issues/48
          ['.gitignore.template', '.gitignore'],
          [/\.md$/, '.md.hbs'],
          [/\.json$/, '.json.hbs'],
          // For the web
          [/\.webmanifest$/, '.webmanifest.hbs'],
          [/\.html$/, '.html.hbs'],
          [/\.css$/, '.css.hbs'],
          [/\.js$/, '.js.hbs'],
          [/\.ts$/, '.ts.hbs'],
          [/\.vue$/, '.vue.hbs'],
          // Use `.babelrc.template` as name to not trigger babel
          // when requiring the file `.template.js` in end-to-end tests
          // and rename it `.babelrc` afterwards
          ['.babelrc.template', '.babelrc'],
          ['.eslintrc.js.hbs', '.eslintrc.js'],
          // For iOS
          [/\.swift$/, '.swift.hbs'],
          // For Android
          [/\.java$/, '.java.hbs'],
          [/\.xml$/, '.xml.hbs'],
        ])
      )
      .use(inPlace())
      .build((err) => {
        if (err) {
          reject(err);
        }

        resolve();
      });
  });
};
