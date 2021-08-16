#!/usr/bin/env node

/* eslint-disable import/no-commonjs, no-console */

const path = require('path');
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

// expose only the es entry point, not the umd entry point
shell.mv(
  path.join(__dirname, '../../es/index.es.d.ts'),
  path.join(__dirname, '../../es/index.d.ts')
);

console.log();
console.log(`Validating definitions...`);

const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');

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
