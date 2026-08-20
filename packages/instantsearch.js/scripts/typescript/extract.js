#!/usr/bin/env node

/* eslint-disable import/no-commonjs, no-console */

const path = require('path');

const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');
const shell = require('shelljs');

console.log(`Compiling definitions...`);

shell.exec(
  `tsc -p ${path.join(__dirname, 'tsconfig.declaration.json')} --outDir es/`
);

// replace block ts-ignore comments with line ones to support TS < 3.9
shell.sed(
  '-i',
  /\/\*\* @ts-ignore \*\//g,
  '// @ts-ignore',
  path.join(__dirname, '../../es/**/*.d.ts')
);

// remove @jsx pragma comments (as jsx is transpiled away)
shell.sed(
  '-i',
  /\/\*\* @jsx h \*\//,
  '',
  path.join(__dirname, '../../es/**/*.d.ts')
);

console.log();
console.log(`Validating definitions...`);

const extractorConfig = ExtractorConfig.loadFileAndPrepare(
  path.resolve(path.join(__dirname, 'api-extractor.json'))
);

const result = Extractor.invoke(extractorConfig, {
  localBuild: true,
  showVerboseMessages: true,
});

if (!result.succeeded) {
  console.error(
    `API Extractor completed with ${result.errorCount} errors` +
      ` and ${result.warningCount} warnings`
  );

  process.exitCode = 1;
}

// move the right entry points
// esm to override umd
shell.mv(
  path.join(__dirname, '../../es/index.es.d.ts'),
  path.join(__dirname, '../../es/index.d.ts')
);

// production and development umd
shell.cp(
  path.join(__dirname, '../../dist/instantsearch.production.d.ts'),
  path.join(__dirname, '../../dist/instantsearch.production.min.d.ts')
);
shell.cp(
  path.join(__dirname, '../../dist/instantsearch.production.d.ts'),
  path.join(__dirname, '../../dist/instantsearch.development.d.ts')
);
