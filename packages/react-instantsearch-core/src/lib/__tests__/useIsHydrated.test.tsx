/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { renderToString } from 'react-dom/server';

import { InstantSearchServerContext } from '../../components/InstantSearchServerContext';
import { InstantSearchSSRProvider } from '../../components/InstantSearchSSRProvider';
import { InstantSearchSSRContext } from '../InstantSearchSSRContext';
import * as serverContext from '../useInstantSearchServerContext';
import * as ssrContext from '../useInstantSearchSSRContext';
import { useIsHydrated } from '../useIsHydrated';

function Probe({ hook, seen }: { hook: () => boolean; seen?: boolean[] }) {
  const isHydrated = hook();
  seen?.push(isHydrated);

  return <span data-testid="probe">{String(isHydrated)}</span>;
}

function ServerRenderedProbe({
  hook,
  seen,
}: {
  hook: () => boolean;
  seen?: boolean[];
}) {
  return (
    <InstantSearchSSRProvider initialResults={{}}>
      <Probe hook={hook} seen={seen} />
    </InstantSearchSSRProvider>
  );
}

function PartialServerRenderedProbe({
  hook,
  seen,
}: {
  hook: () => boolean;
  seen?: boolean[];
}) {
  return (
    <InstantSearchSSRContext.Provider value={{ initialResults: {} }}>
      <Probe hook={hook} seen={seen} />
    </InstantSearchSSRContext.Provider>
  );
}

// `getServerState` collects results by rendering the tree wrapped in this
// context alone, without the SSR provider, so it is a server render the hook has
// to recognise on its own.
function CollectedProbe({
  hook,
  seen,
}: {
  hook: () => boolean;
  seen?: boolean[];
}) {
  return (
    <InstantSearchServerContext.Provider value={{ notifyServer() {} } as any}>
      <Probe hook={hook} seen={seen} />
    </InstantSearchServerContext.Provider>
  );
}

// Re-reads the hook the way React 16 and 17 see it, since it picks its
// implementation when the module loads. Each mock hands the isolated copy this
// registry's own instances: React so the dispatcher the outer `react-dom`
// renders through matches, and the two context hooks so the providers below are
// the ones it reads.
function requireWithoutSyncExternalStore(): typeof useIsHydrated {
  const legacyReact: Record<string, unknown> = { ...React };
  delete legacyReact.useSyncExternalStore;
  jest.doMock('react', () => legacyReact);
  jest.doMock('../useInstantSearchSSRContext', () => ssrContext);
  jest.doMock('../useInstantSearchServerContext', () => serverContext);

  try {
    let legacy!: typeof useIsHydrated;
    jest.isolateModules(() => {
      ({ useIsHydrated: legacy } = require('../useIsHydrated'));
    });

    return legacy;
  } finally {
    jest.dontMock('react');
    jest.dontMock('../useInstantSearchSSRContext');
    jest.dontMock('../useInstantSearchServerContext');
  }
}

describe('useIsHydrated', () => {
  it('is false on the server', () => {
    expect(renderToString(<Probe hook={useIsHydrated} />)).toContain('false');
  });

  it('is true on the first client render', () => {
    const seen: boolean[] = [];

    render(<Probe hook={useIsHydrated} seen={seen} />);

    expect(seen).toEqual([true]);
  });

  describe('where useSyncExternalStore is unavailable', () => {
    it('is false on the server', () => {
      const legacyUseIsHydrated = requireWithoutSyncExternalStore();

      expect(
        renderToString(<ServerRenderedProbe hook={legacyUseIsHydrated} />)
      ).toContain('false');
    });

    it('flips after an effect when there is server markup to reproduce', async () => {
      const legacyUseIsHydrated = requireWithoutSyncExternalStore();
      const seen: boolean[] = [];

      const { getByTestId } = render(
        <ServerRenderedProbe hook={legacyUseIsHydrated} seen={seen} />
      );

      await waitFor(() => {
        expect(getByTestId('probe')).toHaveTextContent('true');
      });
      expect(seen).toEqual([false, true]);
    });

    it('falls back safely when a partial SSR context has no hydration signal', async () => {
      const legacyUseIsHydrated = requireWithoutSyncExternalStore();
      const seen: boolean[] = [];

      const { getByTestId } = render(
        <PartialServerRenderedProbe hook={legacyUseIsHydrated} seen={seen} />
      );

      await waitFor(() => {
        expect(getByTestId('probe')).toHaveTextContent('true');
      });
      expect(seen).toEqual([false, true]);
    });

    it('is false in the pass that collects server state', () => {
      const legacyUseIsHydrated = requireWithoutSyncExternalStore();

      expect(
        renderToString(<CollectedProbe hook={legacyUseIsHydrated} />)
      ).toContain('false');
    });

    it('is true on the first render of a mount with no server markup', () => {
      const legacyUseIsHydrated = requireWithoutSyncExternalStore();
      const seen: boolean[] = [];

      render(<Probe hook={legacyUseIsHydrated} seen={seen} />);

      expect(seen).toEqual([true]);
    });

    it('is true on the first render of a late mount under a retained provider', () => {
      const legacyUseIsHydrated = requireWithoutSyncExternalStore();
      const seen: boolean[] = [];

      function App({ showProbe }: { showProbe: boolean }) {
        return (
          <InstantSearchSSRProvider initialResults={{}}>
            {showProbe ? (
              <Probe hook={legacyUseIsHydrated} seen={seen} />
            ) : null}
          </InstantSearchSSRProvider>
        );
      }

      const { rerender } = render(<App showProbe={false} />);

      rerender(<App showProbe={true} />);

      expect(seen).toEqual([true]);
    });
  });
});
