/**
 * @jest-environment jsdom
 */

import SearchBox from '../SearchBox.vue';
import { mount, htmlCompat } from '../../../test/utils';
import { __setState } from '../../mixins/widget';
jest.mock('../../mixins/widget');
import '../../../test/utils/sortedHtmlSerializer';

const defaultState = {};

test('renders HTML correctly', () => {
  __setState(defaultState);
  const wrapper = mount(SearchBox);

  expect(wrapper.htmlCompat()).toMatchSnapshot();
});

test('with autofocus', () => {
  __setState(defaultState);
  const wrapper = mount(SearchBox, {
    propsData: {
      autofocus: true,
    },
  });

  expect(wrapper.find('.ais-SearchBox-input')).vueToBeAutofocused();
});

test('with placeholder', () => {
  __setState(defaultState);
  const wrapper = mount(SearchBox, {
    propsData: {
      placeholder: 'Search placeholder',
    },
  });

  expect(wrapper.find('.ais-SearchBox-input').attributes().placeholder).toBe(
    'Search placeholder'
  );
});

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

test('with reset button hidden without refinement', () => {
  __setState({ ...defaultState });

  const wrapper = mount(SearchBox);

  expect(wrapper.find('.ais-SearchBox-reset')).vueToBeHidden();
});

test('with reset button visible with refinement', () => {
  __setState({
    ...defaultState,
    query: 'Hello',
  });

  const wrapper = mount(SearchBox);

  expect(wrapper.find('.ais-SearchBox-reset')).not.vueToBeHidden();
});

test('with stalled search hides the submit, reset and displays the loader', () => {
  __setState({
    ...defaultState,
    isSearchStalled: true,
  });

  const wrapper = mount(SearchBox, {
    propsData: {
      showLoadingIndicator: true,
    },
  });

  expect(wrapper.find('.ais-SearchBox-submit')).vueToBeHidden();

  expect(wrapper.find('.ais-SearchBox-reset')).vueToBeHidden();

  expect(wrapper.find('.ais-SearchBox-loadingIndicator').exists()).toBe(true);
});

test('with stalled search but no `showLoadingIndicator` displays the submit and hides reset, loader', () => {
  __setState({ ...defaultState, isSearchStalled: true });
  const wrapper = mount(SearchBox);

  expect(wrapper.find('.ais-SearchBox-submit')).not.vueToBeHidden();

  expect(wrapper.find('.ais-SearchBox-reset')).vueToBeHidden();

  expect(wrapper.find('.ais-SearchBox-loadingIndicator').exists()).toBe(false);
});

test('with not stalled search displays the submit and hides reset, loader', () => {
  __setState(defaultState);
  const wrapper = mount(SearchBox, {
    propsData: {
      showLoadingIndicator: true,
    },
  });

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
        title="Search"
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
        title="Clear"
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
