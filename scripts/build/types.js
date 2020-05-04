#!/usr/bin/env node

/* eslint-disable import/no-commonjs, no-console */

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

shell.exec(
  `tsc -p tsconfig.declaration.json --outDir es/; mv es/index.es.d.ts es/index.d.ts`
);

console.log();
console.log(`Validating definitions...`);

const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');

const publicExports = [
  '',
  // 'components' -> does not contains index.d.ts yet
  'connectors',
  // 'lib', -> Api extrator "import * as ___ from ___;" is not supported yet for local files
  // 'middleware',
  'helpers',
  'types',
  'widgets', //  -> It does not compile as WidgetFactory is not imported in all files
];

shell.cd(__dirname);
shell.mkdir('-p', '.temp');

fs.writeFileSync(
  '.temp/index.d.ts',
  publicExports
    .map(publicExport => `../../../es/${publicExport}`)
    .map(exportedFile => {
      return `export * from '${exportedFile}';`;
    })
    .join('\r\n')
);

const extractorConfig = ExtractorConfig.loadFileAndPrepare(
  path.resolve(path.join(__dirname, '../../', 'api-extractor.json'))
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
