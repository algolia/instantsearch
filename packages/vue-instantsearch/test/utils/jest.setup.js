import createSerializer from 'jest-serializer-html/createSerializer';
import { isVue3, isVue2, Vue2 } from './src/util/vue-compat';

if (isVue2) {
  Vue2.config.productionTip = false;
}

expect.addSnapshotSerializer(
  createSerializer({
    print: {
      sortAttributes: names => names.sort(),
    },
  })
);

const toHaveEmptyHTML = wrapper => {
  const html = wrapper.html();
  if (
    (isVue2 && html === '') ||
    (isVue3 && ['<!---->', '<!--v-if-->'].includes(html))
  ) {
    return {
      pass: true,
    };
  } else {
    return {
      pass: false,
      message: () => `expected ${html} to be an empty HTML string`,
    };
  }
};

const toHaveBooleanAttribute = attribute => wrapper => {
  // :hidden="true" becomes
  // hidden="hidden" in Vue 2 and
  // hidden="" in Vue 3.

  // So we need this to write correct tests to match them in both versions.
  const value = wrapper.attributes(attribute);
  if ((isVue2 && value === attribute) || (isVue3 && value === '')) {
    return { pass: true };
  } else {
    return {
      pass: false,
      message: () => `expected ${wrapper} to have \`${attribute}\` attribute`,
    };
  }
};

expect.extend({
  toHaveEmptyHTML,
  toBeDisabled: toHaveBooleanAttribute('disabled'),
  toBeHidden: toHaveBooleanAttribute('hidden'),
  toBeAutofocused: toHaveBooleanAttribute('autofocus'),
});
