import hogan, { HoganOptions, Template } from 'hogan.js';
import { Templates, HoganHelpers } from '../../types';
import { BindEventForHits } from './createSendEventForHits';

type TransformedHoganHelpers = {
  [helper: string]: () => (text: string) => string;
};

// We add all our template helper methods to the template as lambdas. Note
// that lambdas in Mustache are supposed to accept a second argument of
// `render` to get the rendered value, not the literal `{{value}}`. But
// this is currently broken (see https://github.com/twitter/hogan.js/issues/222).
function transformHelpersToHogan(
  helpers: HoganHelpers = {},
  compileOptions?: HoganOptions,
  data?: Record<string, any>
) {
  return Object.keys(helpers).reduce<TransformedHoganHelpers>(
    (acc, helperKey) => ({
      ...acc,
      [helperKey]() {
        return (text) => {
          const render = (value: string) =>
            (hogan.compile(value, compileOptions) as Template).render(this);

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
}: {
  templates: Templates;
  templateKey: string;
  compileOptions?: HoganOptions;
  helpers?: HoganHelpers;
  data?: Record<string, any>;
  bindEvent?: BindEventForHits;
}) {
  const template = templates[templateKey];

  if (typeof template !== 'string' && typeof template !== 'function') {
    throw new Error(
      `Template must be 'string' or 'function', was '${typeof template}' (key: ${templateKey})`
    );
  }

  if (typeof template === 'function') {
    return template(data, bindEvent!);
  }

  const transformedHelpers = transformHelpersToHogan(
    helpers,
    compileOptions,
    data
  );

  return (hogan.compile(template, compileOptions) as Template)
    .render({
      ...data,
      helpers: transformedHelpers,
    })
    .replace(/[ \n\r\t\f\xA0]+/g, (spaces) =>
      spaces.replace(/(^|\xA0+)[^\xA0]+/g, '$1 ')
    )
    .trim();
}

export default renderTemplate;
