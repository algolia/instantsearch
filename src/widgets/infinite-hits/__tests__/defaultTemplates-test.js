import defaultTemplates from '../defaultTemplates';

describe('hits defaultTemplates', () => {
  it('has a `empty` default template', () => {
    expect(defaultTemplates.empty).toBe('No results');
  });

  it('has a `item` default template', () => {
    const item = {
      hello: 'there,',
      how: {
        are: 'you?',
      },
    };

    const expected = `{
  "hello": "there,",
  "how": {
    "are": "you?"
  }
}`;

    expect(defaultTemplates.item(item)).toBe(expected);
  });
});
