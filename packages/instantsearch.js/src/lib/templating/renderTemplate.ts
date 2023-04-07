import hogan from 'hogan.js';
import htm from 'htm';
import { h, options } from 'preact';

import {
  Highlight,
  ReverseHighlight,
  ReverseSnippet,
  Snippet,
} from '../../helpers/components';

import type { Templates, HoganHelpers, TemplateParams } from '../../types';
import type {
  BindEventForHits,
  SendEventForHits,
} from '../utils/createSendEventForHits';
import type { HoganOptions, Template } from 'hogan.js';

const components = {
  Highlight,
  ReverseHighlight,
  Snippet,
  ReverseSnippet,
};

const oldVnodeOptions = options.vnode;
options.vnode = (vnode) => {
  if ((vnode.type as string) in components) {
    vnode.type = components[
      vnode.type as keyof typeof components
    ] as typeof vnode.type;
  }
  if (oldVnodeOptions) oldVnodeOptions(vnode);
};

export const html = htm.bind(h);

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

export function renderTemplate({
  templates,
  templateKey,
  compileOptions,
  helpers,
  data,
  bindEvent,
  sendEvent,
}: {
  templates: Templates;
  templateKey: string;
  compileOptions?: HoganOptions;
  helpers?: HoganHelpers;
  data?: Record<string, any>;
  bindEvent?: BindEventForHits;
  sendEvent?: SendEventForHits;
}) {
  const template = templates[templateKey];

  if (typeof template !== 'string' && typeof template !== 'function') {
    throw new Error(
      `Template must be 'string' or 'function', was '${typeof template}' (key: ${templateKey})`
    );
  }

  if (typeof template === 'function') {
    // @MAJOR no longer pass bindEvent when string templates are removed
    const params = (bindEvent || {}) as TemplateParams;

    params.html = html;
    (params as any).sendEvent = sendEvent;
    params.components = components;

    // @MAJOR remove the `as any` when string templates are removed
    // needed because not every template receives sendEvent
    return template(data, params as any);
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
