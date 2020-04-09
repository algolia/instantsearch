#!/usr/bin/env node

/* eslint-disable import/no-commonjs, no-console */

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

shell.exec(
  `tsc -p tsconfig.declaration.json --outDir es/; mv es/index.es.d.ts es/index.d.ts`
);

const pkgDir = path.resolve('');

console.log();
console.log(`Validating definitions...`);

const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');

const extractorConfigPath = path.resolve(pkgDir, `api-extractor.json`);
const extractorConfig = ExtractorConfig.loadFileAndPrepare(extractorConfigPath);

const publicExports = [
  '',
  // 'components' -> does not conns index.d.ts yet
  'connectors',
  // 'lib', -> Api extrator "import * as ___ from ___;" is not supported yet for local files
  'middleware',
  'types',
  'widgets', //  -> It does not compile as WidgetFactory is not imported in all files
];

const tempSingleFileApiContentRelativePath = '.temp/index.d.ts';
const tempSingleFileApiContent = publicExports
  .map(publicExport => `../es/${publicExport}`)
  .map(exportedFile => {
    return `export * from '${exportedFile}';`;
  })
  .join('\r\n');

fs.writeFileSync(
  tempSingleFileApiContentRelativePath,
  tempSingleFileApiContent
);
extractorConfig.mainEntryPointFilePath = `${pkgDir}/${tempSingleFileApiContentRelativePath}`;

console.log(
  `Validating type definitions of: ${extractorConfig.mainEntryPointFilePath}`
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
