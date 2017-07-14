import expect from 'expect';
import {searchBox, prepareScreenshot} from './utils.js';

const hide = [
  '.ais-stats--body', // Flaky X ms information.
  '.media-object', // Flaky jpg rendering
];

describe('searchBox', () => {
  describe('when there is no query', () => {
    beforeEach(() => searchBox.clear());

    it('input is empty', () => expect(searchBox.get()).toBe(''));

    it('triggers an empty search', () => {
      expect(browser.getText('#hits')).toNotContain('MP3');
      prepareScreenshot();
      browser.checkDocument({ hide });
    });
  });

  describe('when there is a query', () => {
    beforeEach(() => searchBox.set('mp3'));

    it('fills the input', () => expect(searchBox.get()).toBe('mp3'));

    it('triggers a new search', () => {
      expect(browser.getText('#hits')).toContain('MP3');
      prepareScreenshot();
      browser.checkDocument({ hide });
    });
  });
});
