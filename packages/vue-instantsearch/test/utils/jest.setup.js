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

expect.extend({
  toHaveEmptyHTML: received => {
    const html = received.html();
    if ((isVue2 && html === '') || (isVue3 && html === '<!---->')) {
      return {
        pass: true,
      };
    } else {
      return {
        pass: false,
        message: () => `expected ${html} to be an empty HTML string`,
      };
    }
  },
});
