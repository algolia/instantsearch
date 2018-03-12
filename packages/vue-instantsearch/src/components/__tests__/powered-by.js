import Vue from 'vue';
import PoweredBy from '../PoweredBy.vue';

describe.skip('PoweredBy', () => {
  test('includes the hostname in the URL', () => {
    Object.defineProperty(location, 'hostname', {
      value: 'example.com',
    });

    const vm = new Vue(PoweredBy);

    expect(vm.algoliaUrl).toEqual(
      'https://www.algolia.com/?' +
        'utm_source=vue-instantsearch&' +
        'utm_medium=website&' +
        'utm_content=example.com&' +
        'utm_campaign=poweredby'
    );
  });

  test('has proper HTML rendering', () => {
    const vm = new Vue(PoweredBy);
    vm.$mount();

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });
});
