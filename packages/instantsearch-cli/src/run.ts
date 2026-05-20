import { CommanderError } from 'commander';

import { failureEnvelope, formatEnvelope } from './envelope';
import { defaultIO, type IO } from './io';
import { createProgram, KNOWN_COMMANDS, PROGRAM_NAME } from './program';

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
    if (!(error instanceof CommanderError)) {
      flush(errBuffer, io);
      throw error;
    }
    if (
      error.code === 'commander.helpDisplayed' ||
      error.code === 'commander.version'
    ) {
      flush(errBuffer, io);
      return 0;
    }
    if (error.code === 'commander.unknownOption') {
      emitUnknownFlagEnvelope(argv, error, io);
      return error.exitCode;
    }
    flush(errBuffer, io);
    return error.exitCode;
  }
}

function flush(buffer: string[], io: IO): void {
  if (buffer.length === 0) return;
  io.stderr(buffer.join(''));
  buffer.length = 0;
}

function emitUnknownFlagEnvelope(
  argv: string[],
  error: CommanderError,
  io: IO
): void {
  const badFlag = extractBadFlag(error.message);
  const envelope = failureEnvelope(
    detectCommand(argv),
    'unknown_flag',
    badFlag ? `Unknown flag: ${badFlag}` : error.message
  );

  if (argv.includes('--json')) {
    io.stdout(formatEnvelope(envelope));
  } else {
    io.stderr(`${envelope.message}\n`);
  }
}

function detectCommand(argv: string[]): string {
  for (const token of argv) {
    if (token.startsWith('-')) continue;
    if (KNOWN_COMMANDS.includes(token)) return token;
  }
  return PROGRAM_NAME;
}

function extractBadFlag(message: string): string | null {
  const match = message.match(/'([^']+)'/);
  return match ? match[1] : null;
}
