import { enhanceConfiguration } from '../InstantSearch';

const createWidget = (configuration = {}) => ({
  getConfiguration: () => configuration,
});

describe('enhanceConfiguration', () => {
  it('should return the same object if widget does not provide a configuration', () => {
    const configuration = { analytics: true, page: 2 };
    const widget = {};

    const output = enhanceConfiguration({})(configuration, widget);
    expect(output).toBe(configuration);
  });

  it('should return a new object if widget does provide a configuration', () => {
    const configuration = { analytics: true, page: 2 };
    const widget = createWidget(configuration);

    const output = enhanceConfiguration({})(configuration, widget);
    expect(output).not.toBe(configuration);
  });

  it('should add widget configuration to an empty state', () => {
    const configuration = { analytics: true, page: 2 };
    const widget = createWidget(configuration);

    const output = enhanceConfiguration({})(configuration, widget);
    expect(output).toEqual(configuration);
  });

  it('should call `getConfiguration` from widget correctly', () => {
    const widget = { getConfiguration: jest.fn() };

    const configuration = {};
    const searchParametersFromUrl = {};
    enhanceConfiguration(searchParametersFromUrl)(configuration, widget);

    expect(widget.getConfiguration).toHaveBeenCalled();
    expect(widget.getConfiguration).toHaveBeenCalledWith(
      configuration,
      searchParametersFromUrl
    );
  });

  it('should replace boolean values', () => {
    const actualConfiguration = { analytics: false };
    const widget = createWidget({ analytics: true });

    const output = enhanceConfiguration({})(actualConfiguration, widget);
    expect(output.analytics).toBe(true);
  });

  it('should union array', () => {
    {
      const actualConfiguration = { refinements: ['foo'] };
      const widget = createWidget({ refinements: ['foo', 'bar'] });

      const output = enhanceConfiguration({})(actualConfiguration, widget);
      expect(output.refinements).toEqual(['foo', 'bar']);
    }

    {
      const actualConfiguration = { refinements: ['foo'] };
      const widget = createWidget({ refinements: ['bar'] });

      const output = enhanceConfiguration({})(actualConfiguration, widget);
      expect(output.refinements).toEqual(['foo', 'bar']);
    }

    {
      const actualConfiguration = { refinements: ['foo', 'bar'] };
      const widget = createWidget({ refinements: [] });

      const output = enhanceConfiguration({})(actualConfiguration, widget);
      expect(output.refinements).toEqual(['foo', 'bar']);
    }
  });

  it('should replace nested values', () => {
    const actualConfiguration = { refinements: { lvl1: ['foo'], lvl2: false } };
    const widget = createWidget({ refinements: { lvl1: ['bar'], lvl2: true } });

    const output = enhanceConfiguration({})(actualConfiguration, widget);
    expect(output).toEqual({
      refinements: { lvl1: ['foo', 'bar'], lvl2: true },
    });
  });
});
