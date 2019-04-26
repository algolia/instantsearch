import isPlainObject from '../isPlainObject';

describe('isPlainObject', () => {
  test('with primitive should be false', () => {
    const actual = isPlainObject(1);

    expect(actual).toBe(false);
  });

  test('with literal object should be true', () => {
    const actual = isPlainObject({ name: 'John' });

    expect(actual).toBe(true);
  });

  test('with literal object containing the `constructor` key should be true', () => {
    const actual = isPlainObject({ constructor: 'present' });

    expect(actual).toBe(true);
  });

  test('with constructor should be false', () => {
    function Foo(): void {}

    const actual = isPlainObject(new Foo());

    expect(actual).toBe(false);
  });

  test('with array should be false', () => {
    const actual = isPlainObject([1, 2, 3]);

    expect(actual).toBe(false);
  });

  test('with Object.create should be true', () => {
    const actual = isPlainObject(Object.create(null));

    expect(actual).toBe(true);
  });
});
