#!/usr/bin/env node
import process from 'node:process';

import { Command } from 'commander';

import { init, type InitOptions } from './init';
import { addExperience } from './add-experience';
import { addWidget } from './add-widget';
import type { ExperienceSchema } from '../manifest';
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

type SchemaFlagOptions = {
  hitsTitle?: string;
  hitsImage?: string;
  hitsDescription?: string;
  refinementListAttribute?: string;
  sortByReplicas?: string;
};

type AddExperienceFlagOptions = SchemaFlagOptions & {
  json?: boolean;
  yes?: boolean;
  template?: string;
  index?: string;
};

function parseReplicasFlag(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  return value
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);
}

function buildSchemaFromFlags(opts: SchemaFlagOptions): ExperienceSchema {
  const schema: ExperienceSchema = {};
  if (opts.hitsTitle) {
    schema.hits = {
      title: opts.hitsTitle,
      ...(opts.hitsImage ? { image: opts.hitsImage } : {}),
      ...(opts.hitsDescription ? { description: opts.hitsDescription } : {}),
    };
  }
  if (opts.refinementListAttribute) {
    schema.refinementList = { attribute: opts.refinementListAttribute };
  }
  const replicas = parseReplicasFlag(opts.sortByReplicas);
  if (replicas) {
    schema.sortBy = { replicas };
  }
  return schema;
}

async function runAddExperience(
  name: string,
  cliOptions: AddExperienceFlagOptions
): Promise<void> {
  const json = Boolean(cliOptions.json);
  const template = cliOptions.template ?? 'search';

  let report: Report;
  if (!cliOptions.index) {
    report = failure({
      command: 'add experience',
      code: 'missing_required_flag',
      message: 'Missing required flags: --index',
    });
  } else {
    const schema = buildSchemaFromFlags(cliOptions);
    report = await addExperience({
      projectDir: process.cwd(),
      name,
      template,
      indexName: cliOptions.index,
      ...(Object.keys(schema).length > 0 ? { schema } : {}),
    });
  }

  process.stdout.write(
    json ? JSON.stringify(report) + '\n' : JSON.stringify(report, null, 2) + '\n'
  );
  process.exit(report.ok ? 0 : 1);
}

program
  .command('add-experience <name>')
  .description('Add a new InstantSearch experience from a template.')
  .option('--json', 'Emit a single JSON object on stdout (implies --yes).')
  .option('--yes', 'Accept defaults without prompting.')
  .option('--template <template>', 'Template to use (search)', 'search')
  .option('--index <index>', 'Algolia index name')
  .option('--hits-title <attr>', 'Record attribute for Hits title')
  .option('--hits-image <attr>', 'Record attribute for Hits image')
  .option('--hits-description <attr>', 'Record attribute for Hits description')
  .option(
    '--refinement-list-attribute <attr>',
    'Facet attribute for RefinementList'
  )
  .option(
    '--sort-by-replicas <list>',
    'Comma-separated replica index names for SortBy'
  )
  .action(runAddExperience);

type AddWidgetFlagOptions = SchemaFlagOptions & {
  json?: boolean;
  yes?: boolean;
  experience?: string;
  index?: string;
};

async function runAddWidget(
  widget: string,
  cliOptions: AddWidgetFlagOptions
): Promise<void> {
  const json = Boolean(cliOptions.json);

  let report: Report;
  if (!cliOptions.experience) {
    report = failure({
      command: 'add widget',
      code: 'missing_required_flag',
      message: 'Missing required flags: --experience',
    });
  } else {
    const schema = buildSchemaFromFlags(cliOptions);
    report = await addWidget({
      projectDir: process.cwd(),
      experience: cliOptions.experience,
      widget,
      ...(cliOptions.index ? { indexName: cliOptions.index } : {}),
      ...(Object.keys(schema).length > 0 ? { schema } : {}),
    });
  }

  process.stdout.write(
    json ? JSON.stringify(report) + '\n' : JSON.stringify(report, null, 2) + '\n'
  );
  process.exit(report.ok ? 0 : 1);
}

program
  .command('add-widget <widget>')
  .description('Add a single InstantSearch widget to an experience.')
  .option('--json', 'Emit a single JSON object on stdout (implies --yes).')
  .option('--yes', 'Accept defaults without prompting.')
  .option('--experience <name>', 'Experience to add the widget to')
  .option('--index <index>', 'Algolia index (required to auto-create the experience)')
  .option('--hits-title <attr>', 'Record attribute for Hits title')
  .option('--hits-image <attr>', 'Record attribute for Hits image')
  .option('--hits-description <attr>', 'Record attribute for Hits description')
  .option(
    '--refinement-list-attribute <attr>',
    'Facet attribute for RefinementList'
  )
  .option(
    '--sort-by-replicas <list>',
    'Comma-separated replica index names for SortBy'
  )
  .action(runAddWidget);

function normalizeArgv(argv: string[]): string[] {
  const copy = argv.slice();
  if (copy[2] === 'add' && copy[3] === 'experience') {
    copy.splice(2, 2, 'add-experience');
  } else if (copy[2] === 'add' && copy[3] === 'widget') {
    copy.splice(2, 2, 'add-widget');
  }
  return copy;
}

program.parseAsync(normalizeArgv(process.argv)).catch((err) => {
  process.stderr.write(String(err) + '\n');
  process.exit(1);
});
