import {
  parsePartialJson,
  parsePartialJsonWithFallback,
  repairPartialJson,
  tryParseJson,
} from '../parse-partial-json';

describe('tryParseJson', () => {
  test('returns parsed value for valid JSON', () => {
    expect(tryParseJson('{"a":1}')).toEqual({ a: 1 });
  });

  test('returns undefined for invalid JSON', () => {
    expect(tryParseJson('{"a":')).toBeUndefined();
  });
});

describe('repairPartialJson', () => {
  test('returns the input unchanged when already well-formed', () => {
    expect(repairPartialJson('{"a":1}')).toBe('{"a":1}');
  });

  test('closes unterminated strings and brackets', () => {
    expect(repairPartialJson('{"intro":"hello')).toBe('{"intro":"hello"}');
  });

  test('drops a trailing comma before a missing closing bracket', () => {
    expect(repairPartialJson('{"a":1,')).toBe('{"a":1}');
  });

  test('resolves a dangling key separator with null', () => {
    expect(repairPartialJson('{"a":"x","b":')).toBe('{"a":"x","b":null}');
  });
});

describe('parsePartialJson', () => {
  test('returns null for empty input', () => {
    expect(parsePartialJson('')).toBeNull();
    expect(parsePartialJson('   ')).toBeNull();
  });

  test('parses complete JSON', () => {
    expect(parsePartialJson('{"a":1}')).toEqual({ a: 1 });
    expect(parsePartialJson('[1,2,3]')).toEqual([1, 2, 3]);
  });

  test('closes unterminated strings', () => {
    expect(parsePartialJson('{"intro":"hello')).toEqual({ intro: 'hello' });
  });

  test('closes unterminated objects and arrays', () => {
    expect(parsePartialJson('{"groups":[{"title":"foo"')).toEqual({
      groups: [{ title: 'foo' }],
    });
  });

  test('resolves a dangling key separator', () => {
    expect(parsePartialJson('{"a":"x","b":')).toEqual({ a: 'x', b: null });
  });

  test('drops a trailing comma before closing', () => {
    expect(parsePartialJson('{"a":1,')).toEqual({ a: 1 });
  });

  test('handles nested streaming output', () => {
    const partial =
      '{"intro":"here","groups":[{"title":"Shoes","results":[{"objectID":"1"';
    expect(parsePartialJson(partial)).toEqual({
      intro: 'here',
      groups: [{ title: 'Shoes', results: [{ objectID: '1' }] }],
    });
  });

  test('tolerates escaped quotes inside strings', () => {
    expect(parsePartialJson('{"quote":"he said \\"hi')).toEqual({
      quote: 'he said "hi',
    });
  });
});

describe('parsePartialJsonWithFallback', () => {
  test('returns the fallback for empty input', () => {
    expect(parsePartialJsonWithFallback('', { prev: true })).toEqual({
      prev: true,
    });
  });

  test('parses valid JSON', () => {
    expect(parsePartialJsonWithFallback('{"a":1}', null)).toEqual({ a: 1 });
  });

  test('falls back through the repair step before giving up', () => {
    expect(parsePartialJsonWithFallback('{"a":"x","b":', { a: 'x' })).toEqual({
      a: 'x',
      b: null,
    });
  });
});
