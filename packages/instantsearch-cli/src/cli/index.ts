#!/usr/bin/env node
import process from 'node:process';

import { Command, CommanderError } from 'commander';

import { init, type InitOptions } from './init';
import { addExperience } from './add-experience';
import { addWidget } from './add-widget';
import { introspect } from './introspect';
import type { ExperienceSchema } from '../manifest';
import { createInquirerPrompter, type Prompter } from '../prompter';
import { failure, type Report } from '../reporter';
import { formatHuman } from '../reporter/format-human';
import type { Flavor, Framework } from '../types';
import { parseCommaSeparated } from '../utils/parsing';

const JSON_MODE = process.argv.includes('--json');
const YES_MODE = JSON_MODE || process.argv.includes('--yes');

if (JSON_MODE) {
  // Commander 4.1.1 writes parse errors via console.error before throwing.
  // Silence them so --json output is a single clean JSON object on stdout.
  // eslint-disable-next-line no-console
  console.error = () => {};
}

function getPrompter(): Prompter | undefined {
  return YES_MODE ? undefined : createInquirerPrompter();
}

function emitAndExit(report: Report): never {
  const output = JSON_MODE
    ? JSON.stringify(report)
    : formatHuman(report);
  process.stdout.write(output + '\n');
  process.exit(report.ok ? 0 : 1);
}

type InitFlagOptions = {
  json?: boolean;
  yes?: boolean;
  flavor?: Flavor;
  framework?: Framework;
  appId?: string;
  searchApiKey?: string;
  componentsPath?: string;
};

async function runInit(cliOptions: InitFlagOptions): Promise<void> {
  const prompter = getPrompter();

  // In non-interactive mode without required flags, fail fast.
  if (!prompter && (!cliOptions.appId || !cliOptions.searchApiKey)) {
    const missing: string[] = [];
    if (!cliOptions.appId) missing.push('--app-id');
    if (!cliOptions.searchApiKey) missing.push('--search-api-key');
    emitAndExit(
      failure({
        command: 'init',
        code: 'missing_required_flag',
        message: `Missing required flags: ${missing.join(', ')}`,
      })
    );
  }

  const options: InitOptions = {
    projectDir: process.cwd(),
    flavor: cliOptions.flavor,
    framework: cliOptions.framework,
    componentsPath: cliOptions.componentsPath,
    appId: cliOptions.appId,
    searchApiKey: cliOptions.searchApiKey,
    prompter,
  };

  emitAndExit(await init(options));
}

const program = new Command();
// Must be set before defining subcommands so they inherit the override; otherwise
// commander calls process.exit directly from subcommand parse errors.
program.exitOverride();

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
  .option('--search-api-key <searchApiKey>', 'Algolia search-only API key')
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
  widgets?: string;
};

function parseReplicasFlag(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  return parseCommaSeparated(value);
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
    const attributes = parseCommaSeparated(opts.refinementListAttribute);
    schema.refinementList = attributes.map((a) => ({ attribute: a }));
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
  const prompter = getPrompter();
  const template = cliOptions.template ?? 'search';

  // In non-interactive mode without --index, fail fast.
  if (!prompter && !cliOptions.index) {
    emitAndExit(
      failure({
        command: 'add experience',
        code: 'missing_required_flag',
        message: 'Missing required flags: --index',
      })
    );
  }

  const schema = buildSchemaFromFlags(cliOptions);
  const widgets = cliOptions.widgets
    ? parseCommaSeparated(cliOptions.widgets)
    : undefined;
  const report = await addExperience({
    projectDir: process.cwd(),
    name,
    template,
    indexName: cliOptions.index,
    widgets,
    ...(Object.keys(schema).length > 0 ? { schema } : {}),
    prompter,
  });

  emitAndExit(report);
}

program
  .command('add-experience <name>')
  .description('Add a new InstantSearch experience from a template.')
  .option('--json', 'Emit a single JSON object on stdout (implies --yes).')
  .option('--yes', 'Accept defaults without prompting.')
  .option('--template <template>', 'Template to use (search)', 'search')
  .option('--index <index>', 'Algolia index name')
  .option('--widgets <list>', 'Comma-separated widget list (overrides template defaults)')
  .option('--hits-title <attr>', 'Searchable record attribute to display as the hit title')
  .option('--hits-image <attr>', 'Record attribute containing an image URL')
  .option('--hits-description <attr>', 'Searchable record attribute to display as the hit description')
  .option(
    '--refinement-list-attribute <attr>',
    'Attribute configured for faceting in your Algolia index'
  )
  .option(
    '--sort-by-replicas <list>',
    'Comma-separated replica index names configured in your Algolia index'
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
  const prompter = getPrompter();

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
      prompter,
    });
  }

  emitAndExit(report);
}

program
  .command('add-widget <widget>')
  .description('Add a single InstantSearch widget to an experience.')
  .option('--json', 'Emit a single JSON object on stdout (implies --yes).')
  .option('--yes', 'Accept defaults without prompting.')
  .option('--experience <name>', 'Experience to add the widget to')
  .option('--index <index>', 'Algolia index (required to auto-create the experience)')
  .option('--hits-title <attr>', 'Searchable record attribute to display as the hit title')
  .option('--hits-image <attr>', 'Record attribute containing an image URL')
  .option('--hits-description <attr>', 'Searchable record attribute to display as the hit description')
  .option(
    '--refinement-list-attribute <attr>',
    'Attribute configured for faceting in your Algolia index'
  )
  .option(
    '--sort-by-replicas <list>',
    'Comma-separated replica index names configured in your Algolia index'
  )
  .action(runAddWidget);

type IntrospectFlagOptions = {
  json?: boolean;
  yes?: boolean;
  index?: string;
  appId?: string;
  searchApiKey?: string;
};

async function runIntrospect(cliOptions: IntrospectFlagOptions): Promise<void> {
  if (!cliOptions.index) {
    return emitAndExit(
      failure({
        command: 'introspect',
        code: 'missing_required_flag',
        message: 'Missing required flags: --index',
      })
    );
  }

  const report = await introspect({
    projectDir: process.cwd(),
    indexName: cliOptions.index,
    appId: cliOptions.appId,
    searchApiKey: cliOptions.searchApiKey,
  });

  emitAndExit(report);
}

program
  .command('introspect')
  .description('Introspect an Algolia index to discover attributes, facets, and replicas.')
  .option('--json', 'Emit a single JSON object on stdout (implies --yes).')
  .option('--yes', 'Accept defaults without prompting.')
  .option('--index <index>', 'Algolia index name')
  .option('--app-id <appId>', 'Algolia application ID (overrides instantsearch.json)')
  .option('--search-api-key <searchApiKey>', 'Algolia search-only API key (overrides instantsearch.json)')
  .action(runIntrospect);

function normalizeArgv(argv: string[]): string[] {
  const copy = argv.slice();
  if (copy[2] === 'add' && copy[3] === 'experience') {
    copy.splice(2, 2, 'add-experience');
  } else if (copy[2] === 'add' && copy[3] === 'widget') {
    copy.splice(2, 2, 'add-widget');
  }
  return copy;
}

program.on('command:*', (operands: string[]) => {
  const invoked = operands.join(' ');
  emitAndExit(
    failure({
      command: 'cli',
      code: 'unknown_command',
      message: `Unknown command '${invoked}'. Supported: init, add experience, add widget, introspect.`,
    })
  );
});

const COMMANDER_SILENT_EXIT_CODES = new Set([
  'commander.helpDisplayed',
  'commander.help',
  'commander.version',
]);

// Map commander's internal error codes to our public failure taxonomy so
// agents don't couple to commander's naming.
const COMMANDER_CODE_MAP: Record<string, string> = {
  'commander.unknownOption': 'unknown_option',
  'commander.unknownCommand': 'unknown_command',
  'commander.missingArgument': 'missing_argument',
  'commander.optionMissingArgument': 'missing_argument',
  'commander.missingMandatoryOptionValue': 'missing_required_flag',
  'commander.invalidOptionArgument': 'invalid_option_value',
  'commander.invalidArgument': 'invalid_argument',
  'commander.variadicArgNotLast': 'invalid_argument',
};

function handleTopLevelError(err: unknown): never {
  if (err instanceof CommanderError && COMMANDER_SILENT_EXIT_CODES.has(err.code)) {
    process.exit(0);
  }
  if (err instanceof CommanderError) {
    emitAndExit(
      failure({
        command: 'cli',
        code: COMMANDER_CODE_MAP[err.code] ?? 'commander_error',
        message: err.message,
      })
    );
  }
  emitAndExit(
    failure({
      command: 'cli',
      code: 'internal_error',
      message: err instanceof Error ? err.message : String(err),
    })
  );
}

// commander's parseAsync can throw synchronously on parse errors (before the
// Promise is created), so a try/catch is needed in addition to .catch.
(async () => {
  try {
    await program.parseAsync(normalizeArgv(process.argv));
  } catch (err) {
    handleTopLevelError(err);
  }
})();
