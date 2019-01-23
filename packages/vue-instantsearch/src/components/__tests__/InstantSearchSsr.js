import { mount } from '@vue/test-utils';
import instantsearch from 'instantsearch.js/es';
import Vue from 'vue';
import InstantSearchSsr from '../InstantSearchSsr';
import SearchBox from '../SearchBox.vue';
import { createSerializedState } from '../../util/testutils/helper';
import { createInstantSearch } from '../../util/createInstantSearch';
import { createFakeClient } from '../../util/testutils/client';

jest.unmock('instantsearch.js/es');

it('requires an injected instantsearch instance ($_ais)', () => {
  expect(() => mount(InstantSearchSsr)).toThrowErrorMatchingInlineSnapshot(
    `"\`rootMixin\` is required when using SSR."`
  );
});

it('renders correctly (empty)', () => {
  const wrapper = mount(InstantSearchSsr, {
    provide: () => ({
      // eslint-disable-next-line camelcase
      $_ais: instantsearch({
        indexName: 'bla',
        searchClient: createFakeClient(),
      }),
    }),
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('renders correctly (with slot used)', () => {
  const wrapper = mount(InstantSearchSsr, {
    provide: () => ({
      // eslint-disable-next-line camelcase
      $_ais: instantsearch({
        indexName: 'bla',
        searchClient: createFakeClient(),
      }),
    }),
    slots: {
      default: '<div>Hi there, this is the main slot</div>',
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('does not call __forceRender on second start', () => {
  const { instantsearch: instance, rootMixin } = createInstantSearch({
    indexName: 'bla',
    searchClient: createFakeClient(),
  });
  instance.hydrate(createSerializedState());
  const forceRenderSpy = jest.spyOn(instance, '__forceRender');

  const wrapper = mount(InstantSearchSsr, {
    ...rootMixin,
    components: {
      AisSearchBox: SearchBox,
    },
    slots: {
      default: SearchBox,
    },
  });

  // called once, for the `SearchBox` widget
  expect(forceRenderSpy).toHaveBeenCalledTimes(1);

  wrapper.destroy();

  mount(InstantSearchSsr, {
    ...rootMixin,
    components: {
      AisSearchBox: SearchBox,
    },
    slots: {
      default: SearchBox,
    },
  });

  // does not call again, since we remove `hydrated` flag on unmount
  expect(forceRenderSpy).toHaveBeenCalledTimes(1);
});

it('does not start too many times', async () => {
  const { instantsearch: instance, rootMixin } = createInstantSearch({
    indexName: 'bla',
    searchClient: createFakeClient(),
  });

  const startSpy = jest.spyOn(instance, 'start');

  mount(InstantSearchSsr, {
    ...rootMixin,
    components: {
      AisSearchBox: SearchBox,
    },
    slots: {
      default: SearchBox,
    },
  });

  // not started yet (next tick)
  expect(startSpy).toHaveBeenCalledTimes(0);

  mount(InstantSearchSsr, {
    ...rootMixin,
    components: {
      AisSearchBox: SearchBox,
    },
    slots: {
      default: SearchBox,
    },
  });

  // does not yet call again, since same instance needs to unmount first
  expect(startSpy).toHaveBeenCalledTimes(0);

  await Vue.nextTick();

  expect(startSpy).toHaveBeenCalledTimes(1);

  await Vue.nextTick();

  expect(startSpy).toHaveBeenCalledTimes(1);
});

it('does not dispose if not yet started', async () => {
  const { instantsearch: instance, rootMixin } = createInstantSearch({
    indexName: 'bla',
    searchClient: createFakeClient(),
  });

  const disposeSpy = jest.spyOn(instance, 'dispose');

  const wrapper = mount(InstantSearchSsr, {
    ...rootMixin,
    components: {
      AisSearchBox: SearchBox,
    },
    slots: {
      default: SearchBox,
    },
  });

  wrapper.destroy();

  // does not yet call, since instance isn't started
  expect(disposeSpy).toHaveBeenCalledTimes(0);

  const wrapperTwo = mount(InstantSearchSsr, {
    ...rootMixin,
    components: {
      AisSearchBox: SearchBox,
    },
    slots: {
      default: SearchBox,
    },
  });
  await Vue.nextTick();

  wrapperTwo.destroy();

  expect(disposeSpy).toHaveBeenCalledTimes(1);
});
