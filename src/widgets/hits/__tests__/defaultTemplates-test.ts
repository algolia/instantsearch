import { TemplateParams } from '../../../types';
import defaultTemplates from '../defaultTemplates';

describe('hits defaultTemplates', () => {
  it('has a `empty` default template', () => {
    expect(defaultTemplates.empty).toBe('No results');
  });

  it('has a `item` default template', () => {
    const item = {
      objectID: '1',
      hello: 'there,',
      how: {
        are: 'you?',
      },
      __position: 4,
      __hitIndex: 3,
    };

    const expected = `{
  "objectID": "1",
  "hello": "there,",
  "how": {
    "are": "you?"
  },
  "__position": 4,
  "__hitIndex": 3
}`;

    expect(
      typeof defaultTemplates.item === 'function' &&
        defaultTemplates.item(item, {} as TemplateParams)
    ).toBe(expected);
  });
});
