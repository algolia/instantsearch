/**
 * @jest-environment jsdom
 */

import { mount, htmlCompat } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
import SearchBox from '../SearchBox.vue';
jest.mock('../../mixins/widget');
import '../../../test/utils/sortedHtmlSerializer';

const defaultState = {};

test('with submit title', () => {
  __setState(defaultState);
  const wrapper = mount(SearchBox, {
    propsData: {
      submitTitle: 'Submit Title',
    },
  });

  expect(wrapper.find('.ais-SearchBox-submit').attributes().title).toBe(
    'Submit Title'
  );
});

test('with reset title', () => {
  __setState(defaultState);
  const wrapper = mount(SearchBox, {
    propsData: {
      resetTitle: 'Clear Title',
    },
  });

  expect(wrapper.find('.ais-SearchBox-reset').attributes().title).toBe(
    'Clear Title'
  );
});

test('with stalled search but no `showLoadingIndicator` displays the submit and hides reset, loader', () => {
  __setState({ ...defaultState, isSearchStalled: true });
  const wrapper = mount(SearchBox, {
    propsData: { showLoadingIndicator: false },
  });

  expect(wrapper.find('.ais-SearchBox-submit')).not.vueToBeHidden();

  expect(wrapper.find('.ais-SearchBox-reset')).vueToBeHidden();

  expect(wrapper.find('.ais-SearchBox-loadingIndicator').exists()).toBe(false);
});

test('with not stalled search displays the submit and hides reset, loader', () => {
  __setState(defaultState);
  const wrapper = mount(SearchBox);

  expect(wrapper.find('.ais-SearchBox-submit')).not.vueToBeHidden();

  expect(wrapper.find('.ais-SearchBox-reset')).vueToBeHidden();

  expect(wrapper.find('.ais-SearchBox-loadingIndicator')).vueToBeHidden();
});

test('blurs input on form submit', async () => {
  __setState(defaultState);
  const wrapper = mount(SearchBox);
  const input = wrapper.find('.ais-SearchBox-input');
  input.element.blur = jest.fn();

  await wrapper.find('.ais-SearchBox-form').trigger('submit');

  expect(input.element.blur).toHaveBeenCalledTimes(1);
});

test('refine on empty string on form reset', async () => {
  const state = { ...defaultState, refine: jest.fn() };
  __setState(state);
  const wrapper = mount(SearchBox);

  await wrapper.find('.ais-SearchBox-form').trigger('reset');

  expect(state.refine).toHaveBeenCalledWith('');
});

test('keep local query when out of sync and input is focused', async () => {
  const state = { ...defaultState, refine: jest.fn() };
  __setState(state);

  const wrapper = mount(SearchBox, { attachTo: document.body });
  const input = wrapper.find('.ais-SearchBox-input');
  input.element.focus();
  await input.setValue('hello');

  await wrapper.setData({ state: { query: 'hel' } });

  expect(input.element.value).toBe('hello');
  expect(state.refine).toHaveBeenLastCalledWith('hello');
});

test('overriding slots', () => {
  __setState({
    ...defaultState,
    isSearchStalled: true,
  });
  const wrapper = mount({
    components: { SearchBox },
    data() {
      return {
        props: {
          showLoadingIndicator: true,
        },
      };
    },
    template: `
      <SearchBox v-bind="props">
        <template v-slot:submit-icon>
          <span>SUBMIT</span>
        </template>
        <template v-slot:reset-icon>
          <span>RESET</span>
        </template>
        <template v-slot:loading-indicator>
          <span>LOADING...</span>
        </template>
      </SearchBox>
    `,
  });

  expect(wrapper.find('.ais-SearchBox-submit').html()).toMatch(/SUBMIT/);
  expect(wrapper.find('.ais-SearchBox-reset').html()).toMatch(/RESET/);
  expect(wrapper.find('.ais-SearchBox-loadingIndicator').html()).toMatch(
    /LOADING.../
  );

  expect(htmlCompat(wrapper.find('.ais-SearchBox-submit').html()))
    .toMatchInlineSnapshot(`
    <button class="ais-SearchBox-submit"
            hidden="hidden"
            title="Submit the search query"
            type="submit"
    >
      <span>
        SUBMIT
      </span>
    </button>
  `);
  expect(htmlCompat(wrapper.find('.ais-SearchBox-reset').html()))
    .toMatchInlineSnapshot(`
    <button class="ais-SearchBox-reset"
            hidden="hidden"
            title="Clear the search query"
            type="reset"
    >
      <span>
        RESET
      </span>
    </button>
  `);
  expect(wrapper.find('.ais-SearchBox-loadingIndicator').html())
    .toMatchInlineSnapshot(`
    <span class="ais-SearchBox-loadingIndicator">
      <span>
        LOADING...
      </span>
    </span>
  `);
});
