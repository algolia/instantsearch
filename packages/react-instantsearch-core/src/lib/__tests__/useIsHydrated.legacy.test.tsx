/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

// `useIsHydrated` has two branches. React 18 and newer read a consumer-local
// `React.useSyncExternalStore` snapshot; React 16 and 17 have no such hook and
// read `InstantSearchHydrationContext`, which only `InstantSearchSSRProvider`
// publishes. This repository installs React 19, so every other suite exercises
// the native branch alone and the fallback goes unobserved.
//
// These tests select the fallback by removing `React.useSyncExternalStore`
// from the module both branch selections read, which keeps those two
// selections in agreement and pins what each branch owes. That is a test of
// the branch contract, not of React 16 or 17: the renderer underneath is still
// React 19, so the commit and effect ordering is React 19's, and only a real
// multi-version job would catch a reconciler difference.
//
// Elements are built with `createElement` rather than JSX because each case
// renders through its own copy of React. JSX would compile against this file's
// import instead of the runtime under test, which is exactly the distinction
// these tests exist to make.

type Branch = 'native' | 'legacy';

type Runtime = {
  React: any;
  h: any;
  useIsHydrated: () => boolean;
  InstantSearchHydrationContext: any;
  InstantSearchSSRProvider: any;
  renderToString: (element: any) => string;
  createRoot: any;
  hydrateRoot: any;
};

/**
 * Loads a fresh copy of the hydration signal against the requested runtime.
 *
 * `useIsHydrated` picks its branch once, at module scope, and
 * `InstantSearchSSRProvider` picks its own on every render. Both read the same
 * `react` module, so mocking that module covers both and keeps the two feature
 * detections in agreement, the way a real React 17 install would.
 */
function load(branch: Branch): Runtime {
  jest.resetModules();

  if (branch === 'legacy') {
    jest.doMock('react', () => {
      const actual = jest.requireActual('react');
      const mocked = { ...actual };
      delete mocked.useSyncExternalStore;
      return mocked;
    });
  } else {
    jest.dontMock('react');
  }

  const React = require('react');
  const { useIsHydrated } = require('../useIsHydrated');
  const {
    InstantSearchHydrationContext,
  } = require('../InstantSearchHydrationContext');
  const {
    InstantSearchSSRProvider,
  } = require('../../components/InstantSearchSSRProvider');
  const { renderToString } = require('react-dom/server');
  const { createRoot, hydrateRoot } = require('react-dom/client');

  expect(typeof React.useSyncExternalStore).toBe(
    branch === 'legacy' ? 'undefined' : 'function'
  );

  return {
    React,
    h: React.createElement,
    useIsHydrated,
    InstantSearchHydrationContext,
    InstantSearchSSRProvider,
    renderToString,
    createRoot,
    hydrateRoot,
  };
}

function createProbe(runtime: Runtime, states: boolean[]) {
  const { h, useIsHydrated } = runtime;

  return function HydrationProbe() {
    const isHydrated = useIsHydrated();
    states.push(isHydrated);

    return h('span', null, String(isHydrated));
  };
}

function createContainer(html?: string) {
  const container = document.createElement('div');

  if (html) {
    container.append(document.createRange().createContextualFragment(html));
  }
  document.body.append(container);

  return container;
}

async function mountClientOnly(runtime: Runtime, element: any) {
  const container = createContainer();
  const root = runtime.createRoot(container);

  await runtime.React.act(async () => {
    root.render(element);
  });

  const html = container.innerHTML;

  await runtime.React.act(async () => {
    root.unmount();
  });
  container.remove();

  return html;
}

async function hydrate(runtime: Runtime, element: any, serverHtml: string) {
  const container = createContainer(serverHtml);
  const recoverableErrors: string[] = [];
  let root: any;

  await runtime.React.act(async () => {
    root = runtime.hydrateRoot(container, element, {
      onRecoverableError: (error: unknown) =>
        recoverableErrors.push(String(error)),
    });
  });

  const html = container.innerHTML;

  await runtime.React.act(async () => {
    root.unmount();
  });
  container.remove();

  return { html, recoverableErrors };
}

const branches: Branch[] = ['native', 'legacy'];

// `InstantSearchSSRProvider` returns from two places: a pass-through branch for
// the propless provider `getServerState()` mounts above the user's own, and the
// ordinary branch carrying server state. Both have to publish the signal.
const providerCases = [
  { name: 'without server state props', props: {} },
  { name: 'with server state props', props: { initialResults: {} } },
];

describe('useIsHydrated across React runtimes', () => {
  beforeEach(() => {
    (global as any).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    jest.dontMock('react');
    jest.resetModules();
  });

  describe('branch selection', () => {
    test('reads the native snapshot, not the context, when React has useSyncExternalStore', async () => {
      const runtime = load('native');
      const { h, InstantSearchHydrationContext } = runtime;
      const states: boolean[] = [];

      // A client-only root is hydrated by definition. The native branch decides
      // that per consumer, so a context claiming otherwise cannot reach it.
      await mountClientOnly(
        runtime,
        h(
          InstantSearchHydrationContext.Provider,
          { value: false },
          h(createProbe(runtime, states))
        )
      );

      expect(states).toEqual([true]);
    });

    test('reads the context when React has no useSyncExternalStore', async () => {
      const runtime = load('legacy');
      const { h, InstantSearchHydrationContext } = runtime;
      const states: boolean[] = [];

      await mountClientOnly(
        runtime,
        h(
          InstantSearchHydrationContext.Provider,
          { value: false },
          h(createProbe(runtime, states))
        )
      );

      expect(states).toEqual([false]);
    });
  });

  describe.each(branches)('on the %s branch', (branch) => {
    describe.each(providerCases)('under an SSR provider $name', ({ props }) => {
      test('masks the server render', () => {
        const runtime = load(branch);
        const { h, InstantSearchSSRProvider } = runtime;
        const states: boolean[] = [];

        const html = runtime.renderToString(
          h(InstantSearchSSRProvider, props, h(createProbe(runtime, states)))
        );

        // On React 16 and 17 this is the only thing keeping storage-derived
        // state out of the server tree. Without the provider's hydration
        // context the consumer falls back to the context default, `true`.
        expect(states).toEqual([false]);
        expect(html).toContain('false');
      });

      test('masks the first hydration render, then unmasks', async () => {
        const runtime = load(branch);
        const { h, InstantSearchSSRProvider } = runtime;
        const serverStates: boolean[] = [];
        const clientStates: boolean[] = [];

        const serverHtml = runtime.renderToString(
          h(
            InstantSearchSSRProvider,
            props,
            h(createProbe(runtime, serverStates))
          )
        );

        const { html, recoverableErrors } = await hydrate(
          runtime,
          h(
            InstantSearchSSRProvider,
            props,
            h(createProbe(runtime, clientStates))
          ),
          serverHtml
        );

        expect(clientStates[0]).toBe(false);
        expect(clientStates[clientStates.length - 1]).toBe(true);
        expect(html).toContain('true');
        expect(recoverableErrors).toEqual([]);
      });

      test('always lifts the mask on a client-only mount', async () => {
        const runtime = load(branch);
        const { h, InstantSearchSSRProvider } = runtime;
        const states: boolean[] = [];

        const html = await mountClientOnly(
          runtime,
          h(InstantSearchSSRProvider, props, h(createProbe(runtime, states)))
        );

        // A client-only mount has no server tree to match, so the signal must
        // end up hydrated. How it gets there differs by branch, and the
        // difference is observable: the native branch reports hydrated on the
        // first render, while the provider fallback starts closed and flips in
        // an effect. That extra closed commit is the accepted cost of the
        // React 16 and 17 fallback, and it is bounded to one commit.
        expect(states[states.length - 1]).toBe(true);
        expect(html).toContain('true');
        expect(states).toEqual(branch === 'native' ? [true] : [false, true]);
      });
    });

    test('leaves a consumer with no SSR provider above it unmasked on the client', async () => {
      const runtime = load(branch);
      const states: boolean[] = [];

      await mountClientOnly(runtime, runtime.h(createProbe(runtime, states)));

      expect(states).toEqual([true]);
    });
  });

  // The branches part company on the server when nothing publishes the context.
  // The native branch answers from its own server snapshot, so it masks whether
  // or not a provider is present. The fallback has only the context default, so
  // a React 16 or 17 server render outside an `InstantSearchSSRProvider` does
  // not mask at all. `getServerState()` always mounts a provider, so the
  // supported SSR entry point stays covered.
  test('the native branch masks a server render with no SSR provider', () => {
    const runtime = load('native');
    const states: boolean[] = [];

    expect(
      runtime.renderToString(runtime.h(createProbe(runtime, states)))
    ).toContain('false');
    expect(states).toEqual([false]);
  });

  test('the fallback branch cannot mask a server render with no SSR provider', () => {
    const runtime = load('legacy');
    const states: boolean[] = [];

    expect(
      runtime.renderToString(runtime.h(createProbe(runtime, states)))
    ).toContain('true');
    expect(states).toEqual([true]);
  });
});
