#!/usr/bin/env node

/* eslint-disable import/no-commonjs, no-console */

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
  'index.d.ts',
  // 'components/index.d.ts' -> does not contains index.d.ts yet
  'connectors/index.d.ts',
  // 'lib/main.d.ts', -> Api extrator "import * as ___ from ___;" is not supported yet for local files
  'middleware/index.d.ts',
  'types/index.d.ts',
  'widgets/index.d.ts', //  -> It does not compile as WidgetFactory is not imported in all files
];

const validateExport = publicExport => {
  extractorConfig.mainEntryPointFilePath = `${pkgDir}/es/${publicExport}`;
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
};

publicExports.forEach(validateExport);
