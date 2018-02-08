import jsHelper from 'algoliasearch-helper';
import configure from '../configure';

const createState = state =>
  jsHelper({ addAlgoliaAgent: () => {} }, '', state).state;

describe('configure', () => {
  it('throws when you pass it a non-plain object', () => {
    [
      () => configure(new Date()),
      () => configure(() => {}),
      () => configure(/ok/),
    ].map(widget => expect(widget).toThrowError(/Usage/));
  });

  it('Applies searchParameters if nothing in configuration yet', () => {
    const widget = configure({ analytics: true });
    const config = widget.getConfiguration(createState({}));
    expect(config).toEqual({
      analytics: true,
    });
  });

  it('Applies searchParameters if nothing conflicting configuration', () => {
    const widget = configure({ analytics: true });
    const config = widget.getConfiguration(createState({ query: 'testing' }));
    expect(config).toEqual({
      analytics: true,
    });
  });

  it('Applies searchParameters with a higher priority', () => {
    const widget = configure({ analytics: true });
    {
      const config = widget.getConfiguration(createState({ analytics: false }));
      expect(config).toEqual({
        analytics: true,
      });
    }
    {
      const config = widget.getConfiguration(
        createState({ analytics: false, extra: true })
      );
      expect(config).toEqual({
        analytics: true,
      });
    }
  });

  it('disposes all of the state set by configure', () => {
    const widget = configure({ analytics: true });

    const nextState = widget.dispose({
      state: createState({
        analytics: true,
        somethingElse: false,
      }),
    });

    expect(nextState).toEqual(
      createState({
        somethingElse: false,
      })
    );
  });

  it('disposes all of the state set by configure in case of a conflict', () => {
    const widget = configure({ analytics: true });

    const nextState = widget.dispose({
      state: createState({
        // even though it's different, it will be deleted
        analytics: false,
        somethingElse: false,
      }),
    });

    expect(nextState).toEqual(
      createState({
        somethingElse: false,
      })
    );
  });
});
