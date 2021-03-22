import prepareTemplateProps from '../prepareTemplateProps';

describe('prepareTemplateProps', () => {
  const defaultTemplates = {
    foo: 'toto',
    bar: 'tata',
  };
  const templatesConfig = {};

  it('should return the default templates and set useCustomCompileOptions to false when using the defaults', () => {
    const defaultsPrepared = prepareTemplateProps({
      defaultTemplates,
      templates: undefined,
      templatesConfig,
    });

    expect(defaultsPrepared.useCustomCompileOptions).toEqual({
      foo: false,
      bar: false,
    });
    expect(defaultsPrepared.templates).toEqual(defaultTemplates);
    expect(defaultsPrepared.templatesConfig).toBe(templatesConfig);
  });

  it('should return the missing default templates and set useCustomCompileOptions for the custom template', () => {
    const templates = { foo: 'baz' };
    const defaultsPrepared = prepareTemplateProps({
      defaultTemplates,
      templates,
      templatesConfig,
    });

    expect(defaultsPrepared.useCustomCompileOptions).toEqual({
      foo: true,
      bar: false,
    });
    expect(defaultsPrepared.templates).toEqual({
      ...defaultTemplates,
      ...templates,
    });
    expect(defaultsPrepared.templatesConfig).toBe(templatesConfig);
  });

  it('should add also the templates that are not in the defaults', () => {
    const templates = {
      foo: 'something else',
      baz: 'Of course!',
    };

    const preparedProps = prepareTemplateProps({
      defaultTemplates,
      templates,
      templatesConfig,
    });

    expect(preparedProps.useCustomCompileOptions).toEqual({
      foo: true,
      bar: false,
      baz: true,
    });
    expect(preparedProps.templates).toEqual({
      ...defaultTemplates,
      ...templates,
    });
    expect(preparedProps.templatesConfig).toBe(templatesConfig);
  });
});
