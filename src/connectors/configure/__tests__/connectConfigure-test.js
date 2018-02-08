import jsHelper from 'algoliasearch-helper';
import connectConfigure from '../connectConfigure';

describe('connectConfigure', () => {
  let makeWidget;
  beforeEach(() => {
    const rendering = jest.fn();
    const noop = jest.fn();
    makeWidget = connectConfigure(rendering, noop);
  });

  it('Applies searchParameters if nothing in configuration yet', () => {
    const widget = makeWidget({ analytics: true });
    const config = widget.getConfiguration(jsHelper.make({}));
    expect(config).toEqual({
      analytics: true,
    });
  });

  it('Applies searchParameters if nothing conflicting configuration', () => {
    const widget = makeWidget({ analytics: true });
    const config = widget.getConfiguration(jsHelper.make({ query: 'testing' }));
    expect(config).toEqual({
      analytics: true,
    });
  });

  it('Applies searchParameters with a higher priority', () => {
    const widget = makeWidget({ analytics: true });
    {
      const config = widget.getConfiguration(
        jsHelper.make({ analytics: false })
      );
      expect(config).toEqual({
        analytics: true,
      });
    }
    {
      const config = widget.getConfiguration(
        jsHelper.make({ analytics: false, extra: true })
      );
      expect(config).toEqual({
        analytics: true,
      });
    }
  });

  it('disposes all of the state set by configure', () => {
    const widget = makeWidget({ analytics: true });

    const nextState = widget.dispose({
      state: jsHelper.make({
        analytics: true,
        somethingElse: false,
      }),
    });

    expect(nextState).toEqual(
      jsHelper.make({
        somethingElse: false,
      })
    );
  });

  it('disposes all of the state set by configure in case of a conflict', () => {
    const widget = makeWidget({ analytics: true });

    const nextState = widget.dispose({
      state: jsHelper.make({
        // even though it's different, it will be deleted
        analytics: false,
        somethingElse: false,
      }),
    });

    expect(nextState).toEqual(
      jsHelper.make({
        somethingElse: false,
      })
    );
  });
});
