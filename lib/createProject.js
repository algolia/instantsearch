const path = require('path');
const metalsmith = require('metalsmith');
const inPlace = require('metalsmith-in-place');

module.exports = function createProject(config) {
  const boilerplateFolder = path.join(__dirname, '../boilerplates');
  const instantsearchBoilerplate = path.join(
    boilerplateFolder,
    'instantsearch.js'
  );

  metalsmith(__dirname)
    .source(instantsearchBoilerplate)
    .destination(config.targetFolderName)
    .metadata(config)
    .use(inPlace())
    .build(function(err) {
      if (err) console.error(err);
    });
};
