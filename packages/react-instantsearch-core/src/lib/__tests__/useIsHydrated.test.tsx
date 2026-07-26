/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { act, render, waitFor } from '@testing-library/react';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import { InstantSearchSSRProvider } from '../../components/InstantSearchSSRProvider';
import { useIsHydrated } from '../useIsHydrated';

import type { RootOptions } from 'react-dom/client';

function HydrationProbe({ renderedStates }: { renderedStates?: boolean[] }) {
  const isHydrated = useIsHydrated();
  renderedStates?.push(isHydrated);

  return <span>{String(isHydrated)}</span>;
}

describe('useIsHydrated', () => {
  test('uses the server state during server rendering', () => {
    const html = renderToString(
      <InstantSearchSSRProvider initialResults={{}}>
        <HydrationProbe />
      </InstantSearchSSRProvider>
    );

    expect(html).toContain('false');
  });

  test('starts hydrated on a client-only root', () => {
    const renderedStates: boolean[] = [];

    render(
      <InstantSearchSSRProvider initialResults={{}}>
        <HydrationProbe renderedStates={renderedStates} />
      </InstantSearchSSRProvider>
    );

    expect(renderedStates[0]).toBe(true);
  });

  test('starts hydrated when mounted after its SSR provider hydrates', async () => {
    const initialStates: boolean[] = [];
    const lateStates: boolean[] = [];
    const { rerender } = render(
      <InstantSearchSSRProvider initialResults={{}}>
        <HydrationProbe renderedStates={initialStates} />
      </InstantSearchSSRProvider>
    );

    await waitFor(() => {
      expect(initialStates).toContain(true);
    });

    rerender(
      <InstantSearchSSRProvider initialResults={{}}>
        <HydrationProbe key="late" renderedStates={lateStates} />
      </InstantSearchSSRProvider>
    );

    expect(lateStates[0]).toBe(true);
  });

  test('keeps a delayed boundary on the server state until it hydrates', async () => {
    let releaseBoundary!: () => void;
    let shouldSuspend = false;
    const boundary = new Promise<void>((resolve) => {
      releaseBoundary = resolve;
    });
    const renderedStates: boolean[] = [];
    const recoverableErrors: unknown[] = [];
    const parentCommitted = jest.fn();

    function DelayedBoundary({ children }: { children: React.ReactNode }) {
      if (shouldSuspend) {
        throw boundary;
      }

      return <>{children}</>;
    }

    function ParentCommitProbe() {
      React.useEffect(parentCommitted, []);
      return null;
    }

    function App({ record = false }: { record?: boolean }) {
      return (
        <InstantSearchSSRProvider initialResults={{}}>
          <ParentCommitProbe />
          <React.Suspense fallback={<span>Loading</span>}>
            <DelayedBoundary>
              <HydrationProbe
                renderedStates={record ? renderedStates : undefined}
              />
            </DelayedBoundary>
          </React.Suspense>
        </InstantSearchSSRProvider>
      );
    }

    const serverHtml = renderToString(<App />);
    const container = document.createElement('div');
    container.appendChild(
      document.createRange().createContextualFragment(serverHtml)
    );
    document.body.appendChild(container);
    const serverProbe = container.querySelector('span');

    shouldSuspend = true;
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, <App record />, {
        onRecoverableError(error) {
          recoverableErrors.push(error);
        },
      } satisfies RootOptions);
    });

    await waitFor(() => {
      expect(parentCommitted).toHaveBeenCalled();
    });

    await act(async () => {
      shouldSuspend = false;
      releaseBoundary();
      await boundary;
    });

    await waitFor(() => {
      expect(renderedStates).toContain(true);
    });
    expect(renderedStates[0]).toBe(false);
    expect(container.querySelector('span')).toBe(serverProbe);
    expect(recoverableErrors).toEqual([]);

    await act(async () => {
      root!.unmount();
    });
    container.remove();
  });
});
