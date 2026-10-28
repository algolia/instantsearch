import { CommanderError } from 'commander';

import { failureEnvelope, formatEnvelope } from './envelope';
import { HandledFailure } from './handled-failure';
import { defaultIO, type IO } from './io';
import { createProgram, KNOWN_COMMANDS, PROGRAM_NAME } from './program';

const BUG_REPORT_URL = 'https://github.com/algolia/instantsearch/issues/new';

type ParserFailureCode =
  | 'unknown_flag'
  | 'invalid_flag'
  | 'unknown_command'
  | 'internal_error';

export async function run(
  argv: string[],
  options: Partial<IO> = {}
): Promise<number> {
  const io: IO = { ...defaultIO(), ...options };
  const errBuffer: string[] = [];
  const program = createProgram({
    stdout: io.stdout,
    stderr: (chunk) => errBuffer.push(chunk),
  });

  try {
    await program.parseAsync(argv, { from: 'user' });
    return 0;
  } catch (error) {
    if (
      error instanceof CommanderError &&
      (error.code === 'commander.helpDisplayed' ||
        error.code === 'commander.version')
    ) {
      io.stderr(errBuffer.join(''));
      return 0;
    }

    if (error instanceof HandledFailure) {
      io.stderr(errBuffer.join(''));
      return error.exitCode;
    }

    const { code, message } = classifyError(error);
    const envelope = failureEnvelope(detectCommand(argv), code, message);
    if (argv.includes('--json')) {
      io.stdout(formatEnvelope(envelope));
    } else {
      io.stderr(`${envelope.message}\n`);
    }
    return error instanceof CommanderError ? error.exitCode : 1;
  }
}

export function classifyError(error: unknown): {
  code: ParserFailureCode;
  message: string;
} {
  if (error instanceof CommanderError) {
    const message = error.message.replace(/^error:\s*/i, '');
    switch (error.code) {
      case 'commander.unknownOption':
        return { code: 'unknown_flag', message };
      case 'commander.unknownCommand':
        return { code: 'unknown_command', message };
      case 'commander.invalidArgument':
      case 'commander.invalidOptionArgument':
        return { code: 'invalid_flag', message };
      default:
        return { code: 'internal_error', message };
    }
  }

  const detail = error instanceof Error ? error.message : String(error);
  return {
    code: 'internal_error',
    message: `${detail}. This is a bug. Please file a report at ${BUG_REPORT_URL}.`,
  };
}

function detectCommand(argv: string[]): string {
  for (const token of argv) {
    if (token.startsWith('-')) continue;
    if (KNOWN_COMMANDS.includes(token)) return token;
  }
  return PROGRAM_NAME;
}
