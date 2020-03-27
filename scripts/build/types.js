#!/usr/bin/env node

/* eslint-disable import/no-commonjs, no-console */

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

shell.exec(
  'tsc -p tsconfig.declaration.json --outDir temp/types; mv temp/types/index.es.d.ts temp/types/index.d.ts'
);

const pkgDir = path.resolve('');
const pkg = require(`${pkgDir}/package.json`);

console.log();
console.log(`Rolling up type definitions for instantsearch...`);

const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');

const extractorConfigPath = path.resolve(pkgDir, `api-extractor.json`);
const extractorConfig = ExtractorConfig.loadFileAndPrepare(extractorConfigPath);
const result = Extractor.invoke(extractorConfig, {
  localBuild: true,
  showVerboseMessages: true,
});

if (result.succeeded) {
  if (pkg.buildOptions && pkg.buildOptions.dts) {
    const dtsPath = path.resolve(pkgDir, pkg.types);

    (async () => {
      const existing = await fs.readFile(dtsPath, 'utf-8');
      const toAdd = await Promise.all(
        pkg.buildOptions.dts.map(file => {
          return fs.readFile(path.resolve(pkgDir, file), 'utf-8');
        })
      );
      await fs.writeFile(dtsPath, `${existing}\n${toAdd.join('\n')}`);
      console.log(`API Extractor completed successfully.`);
    })();
  }
} else {
  console.error(
    `API Extractor completed with ${result.errorCount} errors` +
      ` and ${result.warningCount} warnings`
  );

  process.exitCode = 1;
}
