import { Command, Option } from 'commander';

import { formatEnvelope, successEnvelope } from './envelope';
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
    name: 'init',
    description:
      'Scaffold a new InstantSearch project in the current directory.',
    humanSummary:
      'init: stub command — no files were created in this slice.',
    nextSteps: [
      "Run 'instantsearch init --help' once project scaffolding lands.",
    ],
  },
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
  {
    name: 'introspect',
    description:
      'Inspect an Algolia index and report its searchable structure.',
    humanSummary:
      'introspect: stub command — no Algolia calls are made in this slice.',
    nextSteps: [
      "Run 'instantsearch introspect --help' once introspection lands.",
    ],
  },
] as const satisfies readonly StubDescriptor[];

export const PROGRAM_NAME = 'instantsearch';
export const KNOWN_COMMANDS: ReadonlyArray<string> = STUBS.map((s) => s.name);

export function createProgram(io: IO = defaultIO()): Command {
  const program = new Command();

  program
    .name(PROGRAM_NAME)
    .description('CLI for scaffolding and integrating InstantSearch projects.')
    .version(version)
    .addOption(
      new Option('--json', 'emit machine-readable JSON envelopes').default(false)
    )
    .exitOverride()
    .configureOutput({
      writeOut: (str) => io.stdout(str),
      writeErr: (str) => io.stderr(str),
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
