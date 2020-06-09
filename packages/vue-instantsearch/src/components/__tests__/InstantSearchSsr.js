import { mount } from '@vue/test-utils';
import instantsearch from 'instantsearch.js/es';
import Vue from 'vue';
import InstantSearchSsr from '../InstantSearchSsr';
import SearchBox from '../SearchBox.vue';
import { createFakeClient } from '../../util/testutils/client';

jest.unmock('instantsearch.js/es');

it('requires an injected instantsearch instance ($_ais)', () => {
  expect(() => mount(InstantSearchSsr)).toThrowErrorMatchingInlineSnapshot(
    `"\`createServerRootMixin\` is required when using SSR."`
  );
});

it('renders correctly (empty)', () => {
  const wrapper = mount(InstantSearchSsr, {
    provide: {
      $_ais_ssrInstantSearchInstance: instantsearch({
        indexName: 'bla',
        searchClient: createFakeClient(),
      }),
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`

<div class="ais-InstantSearch ais-InstantSearch--ssr">
</div>

`);
});

it('renders correctly (with slot used)', () => {
  const wrapper = mount(InstantSearchSsr, {
    provide: {
      $_ais_ssrInstantSearchInstance: instantsearch({
        indexName: 'bla',
        searchClient: createFakeClient(),
      }),
    },
    slots: {
      default: '<div>Hi there, this is the main slot</div>',
    },
  });

  expect(wrapper.html()).toMatchInlineSnapshot(`

<div class="ais-InstantSearch ais-InstantSearch--ssr">
  <div>
    Hi there, this is the main slot
  </div>
</div>

`);
});

it('does not start too many times', async () => {
  const search = instantsearch({
    indexName: 'bla',
    searchClient: createFakeClient(),
  });

  const Wrapper = {
    render(h) {
      return h(InstantSearchSsr);
    },
  };

  mount(Wrapper, {
    provide: {
      $_ais_ssrInstantSearchInstance: search,
    },
  });

  const startSpy = jest.spyOn(search, 'start');

  // not started yet (next tick)
  expect(startSpy).toHaveBeenCalledTimes(0);

  mount(Wrapper, {
    provide: {
      $_ais_ssrInstantSearchInstance: search,
    },
  });

  // does not yet call again, since same instance needs to unmount first
  expect(startSpy).toHaveBeenCalledTimes(0);

  await Vue.nextTick();

  expect(startSpy).toHaveBeenCalledTimes(1);

  await Vue.nextTick();

  // doesn't get called any more times
  expect(startSpy).toHaveBeenCalledTimes(1);
});

it('does not dispose if not yet started', async () => {
  const instance = instantsearch({
    indexName: 'bla',
    searchClient: createFakeClient(),
  });

  const disposeSpy = jest.spyOn(instance, 'dispose');

  const wrapper = mount(InstantSearchSsr, {
    provide: {
      $_ais_ssrInstantSearchInstance: instance,
    },
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
    provide: {
      $_ais_ssrInstantSearchInstance: instance,
    },
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
