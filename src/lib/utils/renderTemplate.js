import hogan from 'hogan.js';

// We add all our template helper methods to the template as lambdas. Note
// that lambdas in Mustache are supposed to accept a second argument of
// `render` to get the rendered value, not the literal `{{value}}`. But
// this is currently broken (see https://github.com/twitter/hogan.js/issues/222).
function transformHelpersToHogan(helpers = {}, compileOptions, data) {
  return Object.keys(helpers).reduce(
    (acc, helperKey) => ({
      ...acc,
      [helperKey]() {
        return text => {
          const render = value =>
            hogan.compile(value, compileOptions).render(this);

          return helpers[helperKey].call(data, text, render);
        };
      },
    }),
    {}
  );
}

function renderTemplate({
  templates,
  templateKey,
  compileOptions,
  helpers,
  data,
  bindEvent,
}) {
  const template = templates[templateKey];
  const templateType = typeof template;
  const isTemplateString = templateType === 'string';
  const isTemplateFunction = templateType === 'function';

  if (!isTemplateString && !isTemplateFunction) {
    throw new Error(
      `Template must be 'string' or 'function', was '${templateType}' (key: ${templateKey})`
    );
  }

  if (isTemplateFunction) {
    return template(data, bindEvent);
  }

  const transformedHelpers = transformHelpersToHogan(
    helpers,
    compileOptions,
    data
  );

  return hogan
    .compile(template, compileOptions)
    .render({
      ...data,
      helpers: transformedHelpers,
    })
    .replace(/[ \n\r\t\f\xA0]+/g, spaces =>
      spaces.replace(/(^|\xA0+)[^\xA0]+/g, '$1 ')
    )
    .trim();
}

export default renderTemplate;
