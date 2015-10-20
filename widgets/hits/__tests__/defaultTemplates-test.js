/* eslint-env mocha */

import expect from 'expect';

import defaultTemplates from '../defaultTemplates';

describe('hits defaultTemplates', () => {
  it('has a `empty` default template', () => {
    expect(defaultTemplates.empty).toBe('No results');
  });

  it('has a `item` default template', () => {
    let item = {
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

    expect(defaultTemplates.item(item)).toBe(expected);
  });
});
