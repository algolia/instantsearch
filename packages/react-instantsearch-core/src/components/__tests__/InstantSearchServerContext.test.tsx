import { InstantSearchServerContext } from '../InstantSearchServerContext';

describe('InstantSearchServerContext', () => {
  test('exposes a displayName', () => {
    expect(InstantSearchServerContext.displayName).toEqual(
      'InstantSearchServer'
    );
  });
});
