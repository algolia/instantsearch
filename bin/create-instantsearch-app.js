#! /usr/bin/env node

const shell = require('shelljs');
const path = require('path');
const process = require('process');

const boilerplateFolder = path.join(__dirname, '../boilerplates');
const instantsearchBoilerplate = path.join(boilerplateFolder, 'instantsearch.js');

const targetFolderName = process.argv[2] || 'instantsearch-project';

console.log(`Create your new instantsearch app: ${targetFolderName}`);
shell.cp('-r', instantsearchBoilerplate, targetFolderName);
console.log('Project successfully created 🚀');

// console.log(shell.ls('.').join());
// console.log(shell.ls(boilerplateFolder).join());
// console.log(targetFolderName);
