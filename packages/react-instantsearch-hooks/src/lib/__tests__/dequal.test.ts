import { dequal } from '../dequal';

describe('dequal', () => {
  const areFunctions = (a: any, b: any): boolean =>
    a?.constructor === Function && b?.constructor === Function;

  test('without compare returns false for functions', () => {
    expect(
      dequal(
        () => {},
        () => {}
      )
    ).toEqual(false);
  });

  test('with a compare returns true for functions', () => {
    expect(
      dequal(
        () => {},
        () => {},
        areFunctions
      )
    ).toEqual(true);
  });

  test('without compare returns false for nested functions', () => {
    expect(dequal({ fn: () => {} }, { fn: () => {} })).toEqual(false);
  });

  test('with a compare returns true for nested functions', () => {
    expect(dequal({ fn: () => {} }, { fn: () => {} }, areFunctions)).toEqual(
      true
    );
  });
});
