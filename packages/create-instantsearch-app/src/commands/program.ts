import { Command, Option } from 'commander';

import { runAgentsMd } from './agents-md';
import { HandledFailure } from './handled-failure';
import { runInit } from './init';
import { runIntrospect } from './introspect';
import { defaultIO, type IO } from './io';
import { PROGRAM_NAME } from './program-name';
import version from './version';

export { PROGRAM_NAME };
export const COMMANDS: ReadonlyArray<string> = [
  'init',
  'introspect',
  'agents-md',
];

type IntrospectFlagOptions = {
  index?: string;
  indexName?: string;
  appId?: string;
  searchApiKey?: string;
  apiKey?: string;
};

type InitFlagOptions = {
  componentsPath?: string;
  libPath?: string;
  appId?: string;
  searchApiKey?: string;
  apiKey?: string;
  framework?: 'next-app';
};

function apiKeyAlias(): Option {
  return new Option(
    '--api-key <key>',
    'same as --search-api-key, as in the app generator'
  ).hideHelp();
}

export function createProgram(io: IO = defaultIO()): Command {
  const program = new Command();

  program
    .name(PROGRAM_NAME)
    .description(
      'Add InstantSearch to an existing app, inspect an index, and keep coding agents informed.'
    )
    .version(version, '-v, --version')
    .showSuggestionAfterError(false)
    .addOption(
      new Option('--json', 'emit machine-readable JSON envelopes')
        .default(false)
        .implies({ yes: true })
    )
    .addOption(
      new Option(
        '--yes',
        'run non-interactively; fail if required inputs are missing'
      ).default(false)
    )
    .exitOverride()
    .configureOutput({
      writeOut: (str) => io.stdout(str),
      writeErr: (str) => io.stderr(str),
    });

  program
    .command('init')
    .description(
      'Add InstantSearch to the existing app in the current directory.'
    )
    .option('--components-path <path>', 'directory for generated components')
    .option('--lib-path <path>', 'directory for generated library files')
    .option('--app-id <appId>', 'Algolia Application ID')
    .option('--search-api-key <key>', 'Algolia Search-Only API Key')
    .addOption(apiKeyAlias())
    .addOption(
      new Option(
        '--framework <name>',
        'override the auto-detected host framework'
      ).choices(['next-app'])
    )
    .action(async (flags: InitFlagOptions, cmd: Command) => {
      const { json, yes } = cmd.optsWithGlobals<{
        json: boolean;
        yes: boolean;
      }>();
      const exitCode = await runInit(
        {
          cwd: process.cwd(),
          json: Boolean(json),
          yes: Boolean(yes),
          componentsPath: flags.componentsPath,
          libPath: flags.libPath,
          appId: flags.appId,
          searchApiKey: flags.searchApiKey ?? flags.apiKey,
          framework: flags.framework,
        },
        io
      );
      if (exitCode !== 0) throw new HandledFailure(exitCode);
    });

  program
    .command('introspect')
    .description(
      'Inspect an Algolia index: searchable attributes, facets, image field, and a suggested widget plan.'
    )
    .option(
      '--index <name>',
      'Algolia index name (defaults to ALGOLIA_INDEX_NAME)'
    )
    .addOption(new Option('--index-name <name>', 'same as --index').hideHelp())
    .option('--app-id <appId>', 'Algolia Application ID')
    .option('--search-api-key <key>', 'Algolia Search-Only API Key')
    .addOption(apiKeyAlias())
    .action(async (flags: IntrospectFlagOptions, cmd: Command) => {
      const { json } = cmd.optsWithGlobals<{ json: boolean }>();
      const exitCode = await runIntrospect(
        {
          cwd: process.cwd(),
          json: Boolean(json),
          index: flags.index ?? flags.indexName,
          appId: flags.appId,
          searchApiKey: flags.searchApiKey ?? flags.apiKey,
        },
        io
      );
      if (exitCode !== 0) throw new HandledFailure(exitCode);
    });

  program
    .command('agents-md')
    .description(
      'Write or refresh the managed InstantSearch block in AGENTS.md for coding agents.'
    )
    .action(async (_flags: unknown, cmd: Command) => {
      const { json } = cmd.optsWithGlobals<{ json: boolean }>();
      const exitCode = await runAgentsMd(
        { cwd: process.cwd(), json: Boolean(json) },
        io
      );
      if (exitCode !== 0) throw new HandledFailure(exitCode);
    });

  return program;
}
