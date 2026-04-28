/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { getMessageFromStreamErrorText } from '../utils';

describe('getMessageFromStreamErrorText', () => {
  function encodeAsNestedJson(value: unknown, depth: number): string {
    let result = JSON.stringify(value);
    for (let i = 0; i < depth; i++) {
      result = JSON.stringify(result);
    }
    return result;
  }

  it('unwraps double-encoded JSON with error field (Agent Studio / AI SDK style)', () => {
    const inner = {
      error: 'Max steps per completion limit was reached',
      type: 'MaxStepsPerCompletionError',
      statusCode: 400,
    };
    const errorText = JSON.stringify(JSON.stringify(inner));

    expect(getMessageFromStreamErrorText(errorText)).toBe(
      'Max steps per completion limit was reached'
    );
  });

  it('parses single JSON object with error string', () => {
    expect(
      getMessageFromStreamErrorText(
        '{"error":"Something went wrong","statusCode":400}'
      )
    ).toBe('Something went wrong');
  });

  it('prefers message when present on object', () => {
    expect(
      getMessageFromStreamErrorText('{"message":"Use this text"}')
    ).toBe('Use this text');
  });

  it('returns plain text when not JSON', () => {
    expect(getMessageFromStreamErrorText('plain failure')).toBe('plain failure');
  });

  it('uses type when object has no error or message', () => {
    expect(getMessageFromStreamErrorText('{"type":"CustomError"}')).toBe(
      'CustomError'
    );
  });

  it('unwraps deeply nested JSON strings without fixed depth limits', () => {
    const errorText = encodeAsNestedJson(
      { error: 'Deep nested error message' },
      25
    );

    expect(getMessageFromStreamErrorText(errorText)).toBe(
      'Deep nested error message'
    );
  });

  it('returns Unknown error for whitespace-only input', () => {
    expect(getMessageFromStreamErrorText('   ')).toBe('Unknown error');
  });
});
