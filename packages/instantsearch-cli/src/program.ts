import { Command, Option } from 'commander';

import { formatEnvelope, successEnvelope } from './envelope';
import { HandledFailure } from './handled-failure';
import { runInit } from './init';
import { runIntrospect } from './introspect';
import { defaultIO, type IO } from './io';
import version from './version';

type StubDescriptor = {
  name: string;
  description: string;
  humanSummary: string;
  nextSteps: string[];
};

const STUBS = [
  {
    name: 'add',
    description:
      'Add a widget or capability to an existing InstantSearch project.',
    humanSummary:
      'add: stub command — no files were created in this slice.',
    nextSteps: [
      "Run 'instantsearch add --help' once the add command is implemented.",
    ],
  },
] as const satisfies readonly StubDescriptor[];

export const PROGRAM_NAME = 'instantsearch';
export const KNOWN_COMMANDS: ReadonlyArray<string> = [
  'init',
  'introspect',
  ...STUBS.map((s) => s.name),
];

type InitFlagOptions = {
  componentsPath?: string;
  libPath?: string;
  appId?: string;
  searchApiKey?: string;
  framework?: 'next-app';
};

type IntrospectFlagOptions = {
  index?: string;
  appId?: string;
  searchApiKey?: string;
};

export function createProgram(io: IO = defaultIO()): Command {
  const program = new Command();

  program
    .name(PROGRAM_NAME)
    .description('CLI for scaffolding and integrating InstantSearch projects.')
    .version(version)
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
      'Scaffold a new InstantSearch project in the current directory.'
    )
    .option('--components-path <path>', 'directory for generated components')
    .option('--lib-path <path>', 'directory for generated library files')
    .option('--app-id <appId>', 'Algolia Application ID')
    .option('--search-api-key <key>', 'Algolia Search-Only API Key')
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
          searchApiKey: flags.searchApiKey,
          framework: flags.framework,
        },
        io
      );
      if (exitCode !== 0) throw new HandledFailure(exitCode);
    });

  program
    .command('introspect')
    .description(
      'Inspect an Algolia index and report its searchable structure.'
    )
    .option('--index <name>', 'Algolia index name to inspect')
    .option('--app-id <appId>', 'Algolia Application ID')
    .option('--search-api-key <key>', 'Algolia Search-Only API Key')
    .action(async (flags: IntrospectFlagOptions, cmd: Command) => {
      const { json } = cmd.optsWithGlobals<{ json: boolean }>();
      const exitCode = await runIntrospect(
        {
          cwd: process.cwd(),
          json: Boolean(json),
          index: flags.index,
          appId: flags.appId,
          searchApiKey: flags.searchApiKey,
        },
        io
      );
      if (exitCode !== 0) throw new HandledFailure(exitCode);
    });

  for (const stub of STUBS) {
    program
      .command(stub.name)
      .description(stub.description)
      .action((_options, cmd: Command) => {
        const { json } = cmd.optsWithGlobals<{ json: boolean }>();
        if (json) {
          io.stdout(
            formatEnvelope(
              successEnvelope(stub.name, {
                filesCreated: [],
                nextSteps: [...stub.nextSteps],
              })
            )
          );
        } else {
          io.stdout(`${stub.humanSummary}\n`);
        }
      });
  }

  return program;
}
