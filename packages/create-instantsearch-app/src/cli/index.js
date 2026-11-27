#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const COMMANDS = ['init', 'introspect', 'agents-md'];
const builtCommands = path.join(__dirname, '..', '..', 'dist', 'commands.js');

const [command] = process.argv.slice(2);

if (COMMANDS.includes(command)) {
  if (!fs.existsSync(builtCommands)) {
    console.error(
      'The commands are not built yet: run `yarn build` in packages/create-instantsearch-app.'
    );
    process.exit(1);
  }

  require(builtCommands)
    .run(process.argv.slice(2))
    .then((exitCode) => process.exit(exitCode));
} else {
  require('./create');
}
