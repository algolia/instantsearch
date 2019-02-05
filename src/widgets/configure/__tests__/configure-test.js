import configure from '../configure';

describe('configure', () => {
  it('throws when you pass it a non-plain object', () => {
    [
      () => configure(new Date()),
      () => configure(() => {}),
      () => configure(/ok/),
    ].forEach(widget => expect(widget).toThrow(/Usage/));
  });
});
