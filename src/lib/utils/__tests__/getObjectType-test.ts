import getObjectType from '../getObjectType';

describe('getObjectType', () => {
  test('returns the type of a string', () => {
    expect(getObjectType('string')).toEqual('String');
  });

  test('returns the type of a number', () => {
    expect(getObjectType(2)).toEqual('Number');
  });

  test('returns the type of a boolean', () => {
    expect(getObjectType(true)).toEqual('Boolean');
    expect(getObjectType(false)).toEqual('Boolean');
  });

  test('returns the type of an object', () => {
    expect(getObjectType({})).toEqual('Object');
  });

  test('returns the type of an array', () => {
    expect(getObjectType([])).toEqual('Array');
  });

  test('returns the type of a date', () => {
    expect(getObjectType(new Date())).toEqual('Date');
  });

  test('returns the type of a function', () => {
    expect(getObjectType(function() {})).toEqual('Function');
  });

  test('returns the type of undefined', () => {
    expect(getObjectType(undefined)).toEqual('Undefined');
  });

  test('returns the type of null', () => {
    expect(getObjectType(null)).toEqual('Null');
  });
});
