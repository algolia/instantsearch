import { run } from '../../src/run';

export async function runCapturing(
  argv: string[]
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const stdout: string[] = [];
  const stderr: string[] = [];

  const exitCode = await run(argv, {
    stdout: (chunk) => stdout.push(chunk),
    stderr: (chunk) => stderr.push(chunk),
  });

  return { exitCode, stdout: stdout.join(''), stderr: stderr.join('') };
}

type CapturedIO = {
  stdout: string[];
  stderr: string[];
  io: { stdout: (chunk: string) => void; stderr: (chunk: string) => void };
};

export function captureIO(): CapturedIO {
  const stdout: string[] = [];
  const stderr: string[] = [];
  return {
    stdout,
    stderr,
    io: {
      stdout: (chunk: string) => stdout.push(chunk),
      stderr: (chunk: string) => stderr.push(chunk),
    },
  };
}

export function readEnvelope(stdout: string[]): Record<string, unknown> {
  return JSON.parse(stdout.join(''));
}
