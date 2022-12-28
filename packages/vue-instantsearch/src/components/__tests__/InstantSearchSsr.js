/**
 * @jest-environment jsdom
 */

import { mount, nextTick } from '../../../test/utils';
import instantsearch from 'instantsearch.js/es';
import InstantSearchSsr from '../InstantSearchSsr';
import SearchBox from '../SearchBox.vue';
import { createFakeClient } from '../../util/testutils/client';
import { renderCompat } from '../../util/vue-compat';
import '../../../test/utils/sortedHtmlSerializer';

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
    render: renderCompat((h) => h(InstantSearchSsr)),
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

  await nextTick();

  expect(startSpy).toHaveBeenCalledTimes(1);

  await nextTick();

  // doesn't get called any more times
  expect(startSpy).toHaveBeenCalledTimes(1);
});

it('does not dispose if not yet started', async () => {
  const instance = instantsearch({
    indexName: 'bla',
    searchClient: createFakeClient(),
  });

  const disposeSpy = jest.spyOn(instance, 'dispose');

  const wrapper = mount({
    provide: {
      $_ais_ssrInstantSearchInstance: instance,
    },
    components: {
      InstantSearchSsr,
      SearchBox,
    },
    template: `
      <InstantSearchSsr>
        <SearchBox />
      </InstantSearchSsr>
    `,
  });

  wrapper.destroy();

  // does not yet call, since instance isn't started
  expect(disposeSpy).toHaveBeenCalledTimes(0);

  const wrapperTwo = mount({
    provide: {
      $_ais_ssrInstantSearchInstance: instance,
    },
    components: {
      InstantSearchSsr,
      SearchBox,
    },
    template: `
      <InstantSearchSsr>
        <SearchBox />
      </InstantSearchSsr>
    `,
  });
  await nextTick();

  wrapperTwo.destroy();

  expect(disposeSpy).toHaveBeenCalledTimes(1);
});
