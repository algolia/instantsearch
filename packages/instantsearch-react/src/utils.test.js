/* eslint-env jest, jasmine */

import {
  applyDefaultProps,
  isSpecialClick,
  getTranslation,
  capitalize,
} from './utils';
jest.unmock('./utils');

describe('utils', () => {
  describe('applyDefaultProps', () => {
    it('applies defaults for all undefined values', () => {
      expect(applyDefaultProps({
        definedProp: 'waddup',
        undefinedProp: undefined,
        nullProp: null,
        falsyProp: false,
      }, {
        definedProp: 'oy',
        undefinedProp: 'hello',
        nonExistentProp: 'hey',
        nullProp: 'greetings',
        falsyProp: 'well met',
      })).toEqual({
        definedProp: 'waddup',
        undefinedProp: 'hello',
        nonExistentProp: 'hey',
        nullProp: null,
        falsyProp: false,
      });
    });
  });

  describe('isSpecialClick', () => {
    it('returns true if a modifier key is pressed', () => {
      expect(isSpecialClick({altKey: true})).toBe(true);
      expect(isSpecialClick({ctrlKey: true})).toBe(true);
      expect(isSpecialClick({metaKey: true})).toBe(true);
      expect(isSpecialClick({shiftKey: true})).toBe(true);
    });

    it('returns true if it\'s a middle click', () => {
      expect(isSpecialClick({button: 1})).toBe(true);
    });

    it('returns false otherwise', () => {
      expect(isSpecialClick({})).toBe(false);
    });
  });

  describe('getTranslation', () => {
    it('accepts functions', () => {
      expect(getTranslation(
        'hello',
        {hello: name => `Hi ${name}`},
        {hello: name => `Hello ${name}!`},
        'fellow human'
      )).toBe('Hello fellow human!');
    });

    it('accepts strings', () => {
      expect(getTranslation(
        'hello',
        {hello: 'Hi'},
        {hello: 'Hello'},
        'fellow human'
      )).toBe('Hello');
    });

    it('uses the default translation if none is found', () => {
      expect(getTranslation(
        'hello',
        {hello: name => `Greetings, ${name}`},
        {},
        'traveler'
      )).toBe('Greetings, traveler');
    });

    it('accepts many parameters', () => {
      expect(getTranslation(
        'thing',
        {},
        {thing: (param1, param2) => `${param1} ${param2}`},
        'wat',
        'wut'
      )).toBe('wat wut');
    });
  });

  describe('capitalize', () => {
    it('capitalizes a string', () => {
      expect(capitalize('oooh spooky')).toBe('Oooh spooky');
    });

    it('works with empty strings', () => {
      expect(capitalize('')).toBe('');
    });
  });
});
