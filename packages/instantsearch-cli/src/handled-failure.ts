export class HandledFailure extends Error {
  constructor(public readonly exitCode: number) {
    super(`command failed with exit code ${exitCode}`);
  }
}
