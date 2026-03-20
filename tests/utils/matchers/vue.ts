import {
  isVue3,
  isVue2,
  // @ts-ignore file isn't typed
} from '../../../packages/vue-instantsearch/src/util/vue-compat';

import type { MatcherResult } from 'vitest';

type VueTestWrapper = {
  html: () => string;
  attributes: (attribute: string) => string;
};

export const vueToHaveEmptyHTML = (
  wrapper: VueTestWrapper
): MatcherResult => {
  const html = wrapper.html();
  if (
    (isVue2 && html === '') ||
    (isVue3 && ['<!---->', '<!--v-if-->'].includes(html))
  ) {
    return {
      pass: true,
      message: () => '',
    };
  } else {
    return {
      pass: false,
      message: () => `expected ${html} to be an empty HTML string`,
    };
  }
};

const toHaveBooleanAttribute =
  (attribute: string) =>
  (wrapper: VueTestWrapper): MatcherResult => {
    // :hidden="true" becomes
    // hidden="hidden" in Vue 2 and
    // hidden="" in Vue 3.

    // So we need this to write correct tests to match them in both versions.
    const value = wrapper.attributes(attribute);
    if ((isVue2 && value === attribute) || (isVue3 && value === '')) {
      return {
        pass: true,
        message: () => '',
      };
    } else {
      return {
        pass: false,
        message: () => `expected ${wrapper} to have \`${attribute}\` attribute`,
      };
    }
  };

export const vueToBeDisabled = toHaveBooleanAttribute('disabled');
export const vueToBeHidden = toHaveBooleanAttribute('hidden');
export const vueToBeAutofocused = toHaveBooleanAttribute('autofocus');

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
  interface Assertion<T> {
    vueToHaveEmptyHTML: () => MatcherResult;
    vueToBeDisabled: () => MatcherResult;
    vueToBeHidden: () => MatcherResult;
    vueToBeAutofocused: () => MatcherResult;
  }
}
