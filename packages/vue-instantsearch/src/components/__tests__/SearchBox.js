import SearchBox from '../SearchBox.vue';
import { mount } from '@vue/test-utils';
import { __setState } from '../../mixins/widget';
jest.mock('../../mixins/widget');

const defaultState = {};

test('renders HTML correctly', () => {
  __setState(defaultState);
  const wrapper = mount(SearchBox);

  expect(wrapper.html()).toMatchSnapshot();
});

test('with autofocus', () => {
  __setState(defaultState);
  const wrapper = mount(SearchBox, {
    propsData: {
      autofocus: true,
    },
  });

  expect(wrapper.find('.ais-SearchBox-input').attributes().autofocus).toBe(
    'autofocus'
  );
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

  expect(wrapper.find('.ais-SearchBox-reset').attributes().hidden).toBe(
    'hidden'
  );
});

test('with reset button visible with refinement', () => {
  __setState({
    ...defaultState,
    query: 'Hello',
  });

  const wrapper = mount(SearchBox);

  expect(
    wrapper.find('.ais-SearchBox-reset').attributes().hidden
  ).toBeUndefined();
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

  expect(wrapper.find('.ais-SearchBox-submit').attributes().hidden).toBe(
    'hidden'
  );

  expect(wrapper.find('.ais-SearchBox-reset').attributes().hidden).toBe(
    'hidden'
  );

  expect(wrapper.contains('.ais-SearchBox-loadingIndicator')).toBe(true);
});

test('with stalled search but no `showLoadingIndicator` displays the submit and hides reset, loader', () => {
  __setState({ ...defaultState, isSearchStalled: true });
  const wrapper = mount(SearchBox);

  expect(
    wrapper.find('.ais-SearchBox-submit').attributes().hidden
  ).toBeUndefined();

  expect(wrapper.find('.ais-SearchBox-reset').attributes().hidden).toBe(
    'hidden'
  );

  expect(wrapper.contains('.ais-SearchBox-loadingIndicator')).toBe(false);
});

test('with not stalled search displays the submit and hides reset, loader', () => {
  __setState(defaultState);
  const wrapper = mount(SearchBox, {
    propsData: {
      showLoadingIndicator: true,
    },
  });

  expect(
    wrapper.find('.ais-SearchBox-submit').attributes().hidden
  ).toBeUndefined();

  expect(wrapper.find('.ais-SearchBox-reset').attributes().hidden).toBe(
    'hidden'
  );

  expect(
    wrapper.find('.ais-SearchBox-loadingIndicator').attributes().hidden
  ).toBe('hidden');
});

test('blurs input on form submit', () => {
  __setState(defaultState);
  const wrapper = mount(SearchBox);
  const input = wrapper.find('.ais-SearchBox-input');
  input.element.blur = jest.fn();

  wrapper.find('.ais-SearchBox-form').trigger('submit');

  expect(input.element.blur).toHaveBeenCalledTimes(1);
});

test('refine on empty string on form reset', () => {
  const state = { ...defaultState, refine: jest.fn() };
  __setState(state);
  const wrapper = mount(SearchBox);

  wrapper.find('.ais-SearchBox-form').trigger('reset');

  expect(state.refine).toHaveBeenCalledWith('');
});

test('overriding slots', () => {
  __setState({
    ...defaultState,
    isSearchStalled: true,
  });
  const wrapper = mount(SearchBox, {
    propsData: {
      showLoadingIndicator: true,
    },
    slots: {
      'submit-icon': '<span>SUBMIT</span>',
      'reset-icon': '<span>RESET</span>',
      'loading-indicator': '<span>LOADING...</span>',
    },
  });

  expect(wrapper.find('.ais-SearchBox-submit').html()).toMatch(/SUBMIT/);
  expect(wrapper.find('.ais-SearchBox-reset').html()).toMatch(/RESET/);
  expect(wrapper.find('.ais-SearchBox-loadingIndicator').html()).toMatch(
    /LOADING.../
  );

  expect(wrapper.find('.ais-SearchBox-submit').html()).toMatchInlineSnapshot(`

<button type="submit"
        title="Search"
        hidden="hidden"
        class="ais-SearchBox-submit"
>
  <span>
    SUBMIT
  </span>
</button>

`);
  expect(wrapper.find('.ais-SearchBox-reset').html()).toMatchInlineSnapshot(`

<button type="reset"
        title="Clear"
        hidden="hidden"
        class="ais-SearchBox-reset"
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
