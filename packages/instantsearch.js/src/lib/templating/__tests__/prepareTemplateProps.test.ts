import { prepareTemplateProps } from '../prepareTemplateProps';

describe('prepareTemplateProps', () => {
  const defaultTemplates = {
    foo: () => 'toto',
    bar: () => 'tata',
  };

  it('returns the default templates when no custom templates are given', () => {
    const preparedProps = prepareTemplateProps({
      defaultTemplates,
      templates: undefined,
    });

    expect(preparedProps).toEqual({ templates: defaultTemplates });
  });

  it('overrides the default templates with the custom ones', () => {
    const templates = { foo: () => 'baz' };
    const preparedProps = prepareTemplateProps({
      defaultTemplates,
      templates,
    });

    expect(preparedProps.templates).toEqual({
      foo: templates.foo,
      bar: defaultTemplates.bar,
    });
  });

  it('adds the custom templates that are not in the defaults', () => {
    const templates = {
      foo: () => 'something else',
      baz: () => 'Of course!',
    };
    const preparedProps = prepareTemplateProps({
      defaultTemplates,
      templates,
    });

    expect(preparedProps.templates).toEqual({
      foo: templates.foo,
      bar: defaultTemplates.bar,
      baz: templates.baz,
    });
  });

  it('falls back to the default template when the custom one is undefined', () => {
    const preparedProps = prepareTemplateProps({
      defaultTemplates,
      templates: { foo: undefined },
    });

    expect(preparedProps.templates).toEqual(defaultTemplates);
  });

  it('does not mutate the default templates', () => {
    const templates = { foo: () => 'baz' };

    prepareTemplateProps({ defaultTemplates, templates });

    expect(defaultTemplates.foo()).toBe('toto');
  });
});
