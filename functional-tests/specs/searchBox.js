import expect from 'expect';
import {searchBox} from '../utils.js';

describe('searchBox', () => {
  context('when there is no query', () => {
    beforeEach(() => searchBox.clear());

    it('input is empty', () => expect(searchBox.get()).toBe(''));

    it('triggers an empty search', () => expect(browser.getText('#hits')).toNotContain('MP3'));
  });

  context('when there is a query', () => {
    beforeEach(() => searchBox.set('mp3'));

    it('fills the input', () => expect(searchBox.get()).toBe('mp3'));

    it('triggers a new search', () => expect(browser.getText('#hits')).toContain('MP3'));
  });
});
