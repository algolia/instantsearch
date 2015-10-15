/* eslint-env mocha */

import expect from 'expect';

import defaultTemplates from '../defaultTemplates';

describe('hits defaultTemplates', () => {
  it('has a `empty` default template', () => {
    expect(defaultTemplates.empty).toBe('No results');
  });

  it('has a `hit` default template', () => {
    let hit = {
      hello: 'there,',
      how: {
        are: 'you?'
      }
    };

    let expected =
`{
  "hello": "there,",
  "how": {
    "are": "you?"
  }
}`;

    expect(defaultTemplates.hit(hit)).toBe(expected);
  });
});
