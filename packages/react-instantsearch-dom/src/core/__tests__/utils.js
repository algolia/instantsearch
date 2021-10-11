import * as utils from '../utils';

describe('utils', () => {
  describe('createClassNames', () => {
    it('expect to return classNames', () => {
      const cx = utils.createClassNames('Widget');

      const actual = cx('', null, undefined, false, 'one', 'two').split(' ');
      const expectation = ['ais-Widget', 'ais-Widget-one', 'ais-Widget-two'];

      expect(actual).toEqual(expectation);
    });

    it('expect to return classNames with custom prefix', () => {
      const cx = utils.createClassNames('Widget', 'ris');

      const actual = cx('', null, undefined, false, 'one', 'two').split(' ');
      const expectation = ['ris-Widget', 'ris-Widget-one', 'ris-Widget-two'];

      expect(actual).toEqual(expectation);
    });
  });

  describe('isSpecialClick', () => {
    it('returns true if a modifier key is pressed', () => {
      expect(utils.isSpecialClick({ altKey: true })).toBe(true);
      expect(utils.isSpecialClick({ ctrlKey: true })).toBe(true);
      expect(utils.isSpecialClick({ metaKey: true })).toBe(true);
      expect(utils.isSpecialClick({ shiftKey: true })).toBe(true);
    });

    it("returns true if it's a middle click", () => {
      expect(utils.isSpecialClick({ button: 1 })).toBe(true);
    });

    it('returns false otherwise', () => {
      expect(utils.isSpecialClick({})).toBe(false);
    });
  });

  describe('capitalize', () => {
    it('capitalizes a string', () => {
      expect(utils.capitalize('oooh spooky')).toBe('Oooh spooky');
    });

    it('works with empty strings', () => {
      expect(utils.capitalize('')).toBe('');
    });
  });

  describe('range', () => {
    test('with end', () => {
      expect(utils.range({ end: 4 })).toEqual([0, 1, 2, 3]);
    });

    test('with start and end', () => {
      expect(utils.range({ start: 1, end: 5 })).toEqual([1, 2, 3, 4]);
    });

    test('with end and step', () => {
      expect(utils.range({ end: 20, step: 5 })).toEqual([0, 5, 10, 15]);
    });

    test('rounds decimal array lengths', () => {
      // (5000 - 1) / 500 = 9.998 so we want the array length to be rounded to 10.
      expect(utils.range({ start: 1, end: 5000, step: 500 })).toHaveLength(10);
      expect(utils.range({ start: 1, end: 5000, step: 500 })).toEqual([
        500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000,
      ]);
    });
  });

  describe('find', () => {
    test('returns the first match based on the comparator', () => {
      expect(
        utils.find([1], () => {
          return true;
        })
      ).toBe(1);
      expect(
        utils.find([1, 2], () => {
          return true;
        })
      ).toBe(1);

      expect(
        utils.find([{ nice: false }, { nice: true }], function (el) {
          return el.nice;
        })
      ).toEqual({ nice: true });
    });

    test('returns undefined in non-found cases', () => {
      expect(
        utils.find([], () => {
          return false;
        })
      ).toBeUndefined();
      expect(
        utils.find(undefined, () => {
          return false;
        })
      ).toBeUndefined();

      expect(() => {
        utils.find([1, 2, 3], undefined);
      }).toThrow();
    });
  });
});
