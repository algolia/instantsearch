import expect from 'expect';
import {searchBox} from '../utils.js';

describe('searchBox', () => {
  context('when there is no query', () => {
    beforeEach(() => searchBox.clear());

    it('input is empty', () => searchBox
      .get()
      .then(query => expect(query).toBe(''))
    );

    it('triggers an empty search', () => browser
      .getText('#hits')
      .then(res => expect(res).toNotContain('MP3'))
    );
  });

  context('when there is a query', () => {
    beforeEach(() => searchBox.set('mp3'));

    it('fills the input', () => searchBox
      .get()
      .then(query => expect(query).toBe('mp3'))
    );

    it('triggers a new search', () => browser
      .getText('#hits')
      .then(res => expect(res).toContain('MP3'))
    );
  });
});
