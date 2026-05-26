import { CommanderError } from 'commander';

import { classifyError } from '../src/run';

describe('classifyError', () => {
  it('classifies commander.invalidOptionArgument as invalid_flag', () => {
    const error = new CommanderError(
      1,
      'commander.invalidOptionArgument',
      "option '--api-version <n>' argument 'foo' is invalid"
    );

    expect(classifyError(error)).toEqual({
      code: 'invalid_flag',
      message: "option '--api-version <n>' argument 'foo' is invalid",
    });
  });

  it('classifies commander.unknownOption as unknown_flag', () => {
    const error = new CommanderError(
      1,
      'commander.unknownOption',
      "error: unknown option '--bogus'"
    );

    expect(classifyError(error)).toEqual({
      code: 'unknown_flag',
      message: expect.stringContaining('--bogus'),
    });
  });

  it('classifies commander.unknownCommand as unknown_command', () => {
    const error = new CommanderError(
      1,
      'commander.unknownCommand',
      "error: unknown command 'bogus'"
    );

    expect(classifyError(error)).toEqual({
      code: 'unknown_command',
      message: expect.stringContaining('bogus'),
    });
  });

  it('classifies an unhandled Commander code as internal_error without a bug-report hint', () => {
    const error = new CommanderError(
      1,
      'commander.missingArgument',
      "error: missing required argument 'name'"
    );

    const result = classifyError(error);
    expect(result.code).toBe('internal_error');
    expect(result.message).toBe("missing required argument 'name'");
  });

  it('classifies non-Commander errors as internal_error with a bug-report hint', () => {
    const error = new Error('boom');

    expect(classifyError(error)).toEqual({
      code: 'internal_error',
      message: expect.stringMatching(
        /boom.*github\.com\/algolia\/instantsearch\/issues/is
      ),
    });
  });
});
