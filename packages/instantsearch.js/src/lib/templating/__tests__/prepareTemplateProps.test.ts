import { prepareTemplateProps } from '../prepareTemplateProps';

describe('prepareTemplateProps', () => {
  const defaultTemplates = {
    foo: 'toto',
    bar: 'tata',
  };

  it('should return the default templates when no custom templates are given', () => {
    const defaultsPrepared = prepareTemplateProps({
      defaultTemplates,
      templates: undefined,
    });

    expect(defaultsPrepared).toEqual({ templates: defaultTemplates });
  });

  it('should override the default templates with the custom ones', () => {
    const templates = { foo: 'baz' };
    const defaultsPrepared = prepareTemplateProps({
      defaultTemplates,
      templates,
    });

    expect(defaultsPrepared.templates).toEqual({
      ...defaultTemplates,
      ...templates,
    });
  });

  it('should add also the templates that are not in the defaults', () => {
    const templates = {
      foo: 'something else',
      baz: 'Of course!',
    };

    const preparedProps = prepareTemplateProps({
      defaultTemplates,
      templates,
    });

    expect(preparedProps.templates).toEqual({
      ...defaultTemplates,
      ...templates,
    });
  });

  it('should fall back to the default template when the custom one is undefined', () => {
    const preparedProps = prepareTemplateProps({
      defaultTemplates,
      templates: { foo: undefined },
    });

    expect(preparedProps.templates).toEqual(defaultTemplates);
  });

  it('should not mutate the default templates', () => {
    prepareTemplateProps({ defaultTemplates, templates: { foo: 'baz' } });

    expect(defaultTemplates).toEqual({ foo: 'toto', bar: 'tata' });
  });
});
