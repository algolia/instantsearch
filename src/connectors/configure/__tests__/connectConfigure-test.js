import algoliasearchHelper, { SearchParameters } from 'algoliasearch-helper';

import connectConfigure from '../connectConfigure.js';

const fakeClient = { addAlgoliaAgent: () => {}, search: jest.fn() };

describe('connectConfigure', () => {
  let helper;

  beforeEach(() => {
    helper = algoliasearchHelper(fakeClient, '', {});
  });

  describe('throws on bad usage', () => {
    it('without searchParameters', () => {
      const makeWidget = connectConfigure();
      expect(() => makeWidget()).toThrow();
    });

    it('with a renderFn but no unmountFn', () => {
      expect(() => connectConfigure(jest.fn(), undefined)).toThrow();
    });

    it('with a unmountFn but no renderFn', () => {
      expect(() => connectConfigure(undefined, jest.fn())).toThrow();
    });
  });

  it('should apply searchParameters', () => {
    const makeWidget = connectConfigure();
    const widget = makeWidget({ searchParameters: { analytics: true } });

    const config = widget.getConfiguration(SearchParameters.make({}));
    expect(config).toEqual({ analytics: true });
  });

  it('should apply searchParameters with a higher priority', () => {
    const makeWidget = connectConfigure();
    const widget = makeWidget({ searchParameters: { analytics: true } });

    {
      const config = widget.getConfiguration(
        SearchParameters.make({ analytics: false })
      );
      expect(config).toEqual({ analytics: true });
    }

    {
      const config = widget.getConfiguration(
        SearchParameters.make({ analytics: false, extra: true })
      );
      expect(config).toEqual({ analytics: true });
    }
  });

  it('should apply new searchParameters on refine()', () => {
    const renderFn = jest.fn();
    const makeWidget = connectConfigure(renderFn, jest.fn());
    const widget = makeWidget({ searchParameters: { analytics: true } });

    helper.setState(widget.getConfiguration());
    widget.init({ helper });

    expect(widget.getConfiguration()).toEqual({ analytics: true });
    expect(helper.getState().analytics).toEqual(true);

    const { refine } = renderFn.mock.calls[0][0];
    expect(refine).toBe(widget._refine);

    refine({ hitsPerPage: 3 });

    expect(widget.getConfiguration()).toEqual({ hitsPerPage: 3 });
    expect(helper.getState().analytics).toBe(undefined);
    expect(helper.getState().hitsPerPage).toBe(3);
  });

  it('should dispose all the state set by configure', () => {
    const makeWidget = connectConfigure();
    const widget = makeWidget({ searchParameters: { analytics: true } });

    helper.setState(widget.getConfiguration());
    widget.init({ helper });

    expect(widget.getConfiguration()).toEqual({ analytics: true });
    expect(helper.getState().analytics).toBe(true);

    const nextState = widget.dispose({ state: helper.getState() });

    expect(nextState.analytics).toBe(undefined);
  });
});
