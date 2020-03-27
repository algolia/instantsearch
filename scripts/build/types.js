#!/usr/bin/env node

/* eslint-disable import/no-commonjs, no-console */

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const tmpdir = `${require('os').tmpdir()}/instantsearch.js/types`;
shell.exec(`rm -rf ${tmpdir}`);

shell.exec(
  `tsc -p tsconfig.declaration.json --outDir ${tmpdir}; mv ${tmpdir}/index.es.d.ts ${tmpdir}/index.d.ts`
);

const pkgDir = path.resolve('');
const pkg = require(`${pkgDir}/package.json`);

console.log();
console.log(`Rolling up type definitions for InstantSearch...`);

const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');

const extractorConfigPath = path.resolve(pkgDir, `api-extractor.json`);
const extractorConfig = ExtractorConfig.loadFileAndPrepare(extractorConfigPath);

extractorConfig.mainEntryPointFilePath = `${tmpdir}/index.d.ts`;

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
