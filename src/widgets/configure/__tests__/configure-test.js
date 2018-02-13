import { SearchParameters } from 'algoliasearch-helper';
import configure from '../configure';

describe('configure', () => {
  it('throws when you pass it a non-plain object', () => {
    [
      () => configure({ searchParameters: new Date() }),
      () => configure({ searchParameters: () => {} }),
      () => configure({ searchParameters: /ok/ }),
    ].map(widget => expect(widget).toThrowError(/Usage/));
  });

  it('Applies searchParameters if nothing in configuration yet', () => {
    const widget = configure({ searchParameters: { analytics: true } });
    const config = widget.getConfiguration(SearchParameters.make({}));
    expect(config).toEqual({
      analytics: true,
    });
  });

  it('Applies searchParameters if nothing conflicting configuration', () => {
    const widget = configure({ searchParameters: { analytics: true } });
    const config = widget.getConfiguration(
      SearchParameters.make({ query: 'testing' })
    );
    expect(config).toEqual({
      analytics: true,
    });
  });

  it('Applies searchParameters with a higher priority', () => {
    const widget = configure({ searchParameters: { analytics: true } });
    {
      const config = widget.getConfiguration(
        SearchParameters.make({ analytics: false })
      );
      expect(config).toEqual({
        analytics: true,
      });
    }
    {
      const config = widget.getConfiguration(
        SearchParameters.make({ analytics: false, extra: true })
      );
      expect(config).toEqual({
        analytics: true,
      });
    }
  });

  it('disposes all of the state set by configure', () => {
    const widget = configure({ searchParameters: { analytics: true } });

    const nextState = widget.dispose({
      state: SearchParameters.make({
        analytics: true,
        somethingElse: false,
      }),
    });

    expect(nextState).toEqual(
      SearchParameters.make({
        somethingElse: false,
      })
    );
  });

  it('disposes all of the state set by configure in case of a conflict', () => {
    const widget = configure({ searchParameters: { analytics: true } });

    const nextState = widget.dispose({
      state: SearchParameters.make({
        // even though it's different, it will be deleted
        analytics: false,
        somethingElse: false,
      }),
    });

    expect(nextState).toEqual(
      SearchParameters.make({
        somethingElse: false,
      })
    );
  });
});
