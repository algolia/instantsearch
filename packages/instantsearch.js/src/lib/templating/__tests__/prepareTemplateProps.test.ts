import { prepareTemplateProps } from '../prepareTemplateProps';

describe('prepareTemplateProps', () => {
  const defaultTemplates = {
    foo: () => 'toto',
    bar: () => 'tata',
  };

  it('should override the default templates with the user provided templates', () => {
    const templates = {
      foo: () => 'something else',
      baz: () => 'Of course!',
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
});
