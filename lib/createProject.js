const shell = require('shelljs');
const path = require('path');

module.exports = function createProject(config) {
  const boilerplateFolder = path.join(__dirname, '../boilerplates');
  const instantsearchBoilerplate = path.join(boilerplateFolder, 'instantsearch.js');

  console.log(config);
  shell.cp('-r', instantsearchBoilerplate, config.targetFolderName);
};
