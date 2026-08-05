/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { tryParseErrorMessage } from '../utils';

describe('tryParseErrorMessage', () => {
  it('returns the trimmed `message` from a JSON object', () => {
    expect(tryParseErrorMessage('{"message":"  Something went wrong  "}')).toBe(
      'Something went wrong'
    );
  });

  it('returns the `message` from a full ErrorResponse payload', () => {
    expect(
      tryParseErrorMessage(
        '{"message":"Max steps per completion limit was reached","type":"MaxStepsPerCompletionError","statusCode":400}'
      )
    ).toBe('Max steps per completion limit was reached');
  });

  it('returns undefined for non-JSON input', () => {
    expect(tryParseErrorMessage('plain failure')).toBeUndefined();
  });

  it('returns undefined for JSON without a string `message`', () => {
    expect(tryParseErrorMessage('{"type":"CustomError"}')).toBeUndefined();
    expect(tryParseErrorMessage('{"message":123}')).toBeUndefined();
    expect(tryParseErrorMessage('{"message":"   "}')).toBeUndefined();
  });

  it('returns undefined for arrays and primitives', () => {
    expect(tryParseErrorMessage('[{"message":"nope"}]')).toBeUndefined();
    expect(tryParseErrorMessage('"just a string"')).toBeUndefined();
  });

  it('returns undefined for empty input', () => {
    expect(tryParseErrorMessage('')).toBeUndefined();
  });
});
