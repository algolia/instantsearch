#! /usr/bin/env node

const process = require('process');
const path = require('path');
const program = require('commander');
const prompt = require('prompt');
const colors = require('colors');

const version = require('../package.json').version;
const createProject = require('../lib/createProject.js');

let opts = {};
let targetFolderName;

program
  .version(version)
  .arguments('<destination_folder>')
  .option('--app-id <appId>', 'The application ID')
  .option('--api-key <apiKey>', 'The Algolia search API key')
  .option('--index-name <indexName>', 'The main index of your search')
  .option(
    '--main-attribute <attributeName>',
    'The main searchable attribute of your index'
  )
  .action(function(dest, options) {
    opts = options;
    targetFolderName = dest;
  })
  .parse(process.argv);

if (!targetFolderName) {
  console.log(
    'The folder name for the new instantsearch project was not provided 😲'.red
  );
  program.help();
}

console.log(
  `Creating your new instantsearch app: ${targetFolderName.bold}`.green
);

let prompts = [
  { name: 'appId', description: 'Application ID'.blue, required: true },
  { name: 'apiKey', description: 'Search API key'.blue, required: true },
  { name: 'indexName', description: 'Index name'.blue, required: true },
  {
    name: 'attributeName',
    description: 'Main searchable attribute'.blue,
    required: false,
  },
];

prompt.message = '';
prompt.override = opts;

prompt.start();
prompt.get(prompts, function(err, config) {
  if (err) {
    console.log('\nProject creation cancelled 😢'.red);
    process.exit(0);
  } else {
    config.name = targetFolderName;
    config.targetFolderName = path.join(process.cwd(), targetFolderName);
    createProject(config);
    console.log('Project successfully created 🚀'.green.bold);
  }
});
