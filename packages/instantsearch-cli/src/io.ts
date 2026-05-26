export type IO = {
  stdout: (chunk: string) => void;
  stderr: (chunk: string) => void;
};

export function defaultIO(): IO {
  return {
    stdout: (chunk) => process.stdout.write(chunk),
    stderr: (chunk) => process.stderr.write(chunk),
  };
}
