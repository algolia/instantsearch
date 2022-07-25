import { TemplateParams } from '../../../types';
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
      objectID: 'lol',
      __position: 42,
      __hitIndex: 1,
    };

    const expected = `{
  "hello": "there,",
  "how": {
    "are": "you?"
  },
  "objectID": "lol",
  "__position": 42,
  "__hitIndex": 1
}`;

    expect(
      typeof defaultTemplates.item === 'function' &&
        defaultTemplates.item(item, {} as TemplateParams)
    ).toBe(expected);
  });

  it('has a `showPreviousText` default template', () => {
    expect(defaultTemplates.showPreviousText).toMatchInlineSnapshot(
      `"Show previous results"`
    );
  });
});
