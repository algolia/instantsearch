#!/usr/bin/env node
import process from 'node:process';

import { Command, CommanderError } from 'commander';

import { normalizeArgv } from './aliases';
import {
  commanderErrorToFailure,
  isSilentCommanderExit,
} from './commander-errors';
import { init, type InitOptions } from './init';
import { addExperience } from './add-experience';
import { addWidget } from './add-widget';
import { introspect } from './introspect';
import { createCliRuntime } from './runtime';
import {
  buildSchemaFromFlags,
  type SchemaFlagOptions,
} from './schema-flags';
import { failure, type Report } from '../reporter';
import type { Flavor, Framework } from '../types';

const runtime = createCliRuntime();

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
  const prompter = runtime.getPrompter();

  // In non-interactive mode without required flags, fail fast.
  if (!prompter && (!cliOptions.appId || !cliOptions.searchApiKey)) {
    const missing: string[] = [];
    if (!cliOptions.appId) missing.push('--app-id');
    if (!cliOptions.searchApiKey) missing.push('--search-api-key');
    runtime.emitAndExit(
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

  runtime.emitAndExit(await init(options));
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

type AddExperienceFlagOptions = SchemaFlagOptions & {
  json?: boolean;
  yes?: boolean;
  template?: string;
  index?: string;
};

async function runAddExperience(
  name: string,
  cliOptions: AddExperienceFlagOptions
): Promise<void> {
  const prompter = runtime.getPrompter();
  const template = cliOptions.template ?? 'search';

  // In non-interactive mode without --index, fail fast.
  if (!prompter && !cliOptions.index) {
    runtime.emitAndExit(
      failure({
        command: 'add experience',
        code: 'missing_required_flag',
        message: 'Missing required flags: --index',
      })
    );
  }

  const schema = buildSchemaFromFlags(cliOptions);
  const report = await addExperience({
    projectDir: process.cwd(),
    name,
    template,
    indexName: cliOptions.index,
    ...(Object.keys(schema).length > 0 ? { schema } : {}),
    prompter,
  });

  runtime.emitAndExit(report);
}

program
  .command('add-experience <name>')
  .description('Add a new InstantSearch experience from a template.')
  .option('--json', 'Emit a single JSON object on stdout (implies --yes).')
  .option('--yes', 'Accept defaults without prompting.')
  .option('--template <template>', 'Template to use (search)', 'search')
  .option('--index <index>', 'Algolia index name')
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
  const prompter = runtime.getPrompter();

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

  runtime.emitAndExit(report);
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
    return runtime.emitAndExit(
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

  runtime.emitAndExit(report);
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

program.on('command:*', (operands: string[]) => {
  const invoked = operands.join(' ');
  runtime.emitAndExit(
    failure({
      command: 'cli',
      code: 'unknown_command',
      message: `Unknown command '${invoked}'. Supported: init, add experience, add widget, introspect.`,
    })
  );
});

function handleTopLevelError(err: unknown): never {
  if (err instanceof CommanderError && isSilentCommanderExit(err)) {
    return process.exit(0);
  }
  if (err instanceof CommanderError) {
    return runtime.emitAndExit(commanderErrorToFailure(err));
  }
  return runtime.emitAndExit(
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
