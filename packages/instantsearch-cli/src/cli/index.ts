#!/usr/bin/env node
import process from 'node:process';

import { Command } from 'commander';

import { init, type InitOptions } from './init';
import { failure, type Report } from '../reporter';
import type { Flavor, Framework } from '../types';

type InitFlagOptions = {
  json?: boolean;
  yes?: boolean;
  flavor?: Flavor;
  framework?: Framework;
  appId?: string;
  searchKey?: string;
  componentsPath?: string;
};

async function runInit(cliOptions: InitFlagOptions): Promise<void> {
  const json = Boolean(cliOptions.json);

  const missing: string[] = [];
  if (!cliOptions.appId) missing.push('--app-id');
  if (!cliOptions.searchKey) missing.push('--search-key');

  let report: Report;
  if (missing.length > 0) {
    report = failure({
      command: 'init',
      code: 'missing_required_flag',
      message: `Missing required flags: ${missing.join(', ')}`,
    });
  } else {
    const options: InitOptions = {
      projectDir: process.cwd(),
      flavor: cliOptions.flavor,
      framework: cliOptions.framework,
      componentsPath: cliOptions.componentsPath,
      appId: cliOptions.appId!,
      searchApiKey: cliOptions.searchKey!,
    };
    report = await init(options);
  }

  process.stdout.write(
    json ? JSON.stringify(report) + '\n' : JSON.stringify(report, null, 2) + '\n'
  );
  process.exit(report.ok ? 0 : 1);
}

const program = new Command();

program
  .name('instantsearch')
  .description('Install and pre-configure InstantSearch widgets into an existing project.')
  .version('0.0.0');

program
  .command('init')
  .description('Initialize InstantSearch in the current project.')
  .option('--json', 'Emit a single JSON object on stdout (implies --yes).')
  .option('--yes', 'Accept defaults without prompting.')
  .option('--flavor <flavor>', 'react | js')
  .option('--framework <framework>', 'nextjs (omit for bare library)')
  .option('--app-id <appId>', 'Algolia application ID')
  .option('--search-key <searchKey>', 'Algolia search-only API key')
  .option('--components-path <path>', 'Path where components will be generated')
  .action(runInit);

program.parseAsync(process.argv).catch((err) => {
  process.stderr.write(String(err) + '\n');
  process.exit(1);
});
