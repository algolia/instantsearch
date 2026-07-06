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
