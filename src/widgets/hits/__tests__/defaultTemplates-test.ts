import defaultTemplates from '../defaultTemplates';

describe('hits defaultTemplates', () => {
  it('has a `empty` default template', () => {
    expect(defaultTemplates.empty).toBe('No results');
  });

  it('has a `item` default template', () => {
    const item = {
      __position: 0,
      __hitIndex: 1,
      objectID: '2',
      hello: 'there,',
      how: {
        are: 'you?',
      },
    };

    const expected = `{
  "__position": 0,
  "__hitIndex": 1,
  "objectID": "2",
  "hello": "there,",
  "how": {
    "are": "you?"
  }
}`;

    expect(
      typeof defaultTemplates.item === 'function' &&
        defaultTemplates.item(item, () => '')
    ).toBe(expected);
  });
});
