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
});
