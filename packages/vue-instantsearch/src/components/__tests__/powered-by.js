import { mount } from '@vue/test-utils';
import PoweredBy from '../PoweredBy.vue';
jest.mock('../../mixins/widget');

test('includes the hostname in the URL', () => {
  const wrapper = mount(PoweredBy);

  const algoliaURL = new URL(wrapper.vm.algoliaUrl);

  expect(algoliaURL.origin).toBe('https://www.algolia.com');
  expect(algoliaURL.searchParams.get('utm_source')).toBe('vue-instantsearch');
  expect(algoliaURL.searchParams.get('utm_medium')).toBe('website');
  expect(algoliaURL.searchParams.get('utm_content')).toBe(location.hostname);
  expect(algoliaURL.searchParams.get('utm_content')).toBe('example.com');
  expect(algoliaURL.searchParams.get('utm_campaign')).toBe('poweredby');
});

test('has proper HTML rendering', () => {
  const wrapper = mount(PoweredBy);

  expect(wrapper.html()).toMatchSnapshot();
});

test('has proper HTML rendering (dark)', () => {
  const wrapper = mount(PoweredBy, {
    propsData: {
      theme: 'dark',
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});
