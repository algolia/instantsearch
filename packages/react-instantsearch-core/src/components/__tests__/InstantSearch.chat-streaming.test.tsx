/**
 * @jest-environment node
 */

import { PassThrough } from 'stream';

import { createSearchClient } from '@instantsearch/mocks';
import { Chat } from 'instantsearch.js/es/lib/chat';
import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';

import { useChat } from '../../connectors/useChat';
import { InstantSearch } from '../InstantSearch';
import { InstantSearchSSRProvider } from '../InstantSearchSSRProvider';

test('keeps a captured custom Chat snapshot through streaming server rendering', async () => {
  const searchClient = createSearchClient({});
  const chat = new Chat<any>({ persistence: false });
  chat.messages = [
    {
      id: 'captured-assistant',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Captured answer' }],
    },
  ];
  let shouldSuspend = true;
  let releaseBoundary!: () => void;
  const boundary = new Promise<void>((resolve) => {
    releaseBoundary = resolve;
  });

  function DelayedBoundary({ children }: { children: React.ReactNode }) {
    if (shouldSuspend) {
      throw boundary;
    }

    return <>{children}</>;
  }

  function ChatStateProbe() {
    const { messages } = useChat({ chat, requiresSearch: false });
    const text = messages
      .flatMap((message) => message.parts)
      .map((part) => ('text' in part ? part.text : ''))
      .join('');

    return <span data-chat-messages>{text}</span>;
  }

  const app = (
    <InstantSearchSSRProvider initialResults={{}}>
      <InstantSearch searchClient={searchClient} indexName="indexName">
        <React.Suspense fallback={<span>Loading</span>}>
          <DelayedBoundary>
            <ChatStateProbe />
          </DelayedBoundary>
        </React.Suspense>
      </InstantSearch>
    </InstantSearchSSRProvider>
  );

  const html = await new Promise<string>((resolve, reject) => {
    const destination = new PassThrough();
    const chunks: Buffer[] = [];
    destination.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    destination.on('end', () =>
      resolve(Buffer.concat(chunks).toString('utf8'))
    );
    destination.on('error', reject);

    const { pipe } = renderToPipeableStream(app, {
      onShellReady() {
        chat.messages = [
          {
            id: 'live-assistant',
            role: 'assistant',
            parts: [{ type: 'text', text: 'Live answer' }],
          },
        ];
        shouldSuspend = false;
        releaseBoundary();
        pipe(destination);
      },
      onError: reject,
    });
  });

  expect(html).toContain('Captured answer');
  expect(html).not.toContain('Live answer');
});

test('freezes status and error alongside the captured messages', async () => {
  const searchClient = createSearchClient({});
  const chat = new Chat<any>({ persistence: false });
  chat.messages = [
    {
      id: 'captured-assistant',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Captured answer' }],
    },
  ];
  let shouldSuspend = true;
  let releaseBoundary!: () => void;
  const boundary = new Promise<void>((resolve) => {
    releaseBoundary = resolve;
  });

  function DelayedBoundary({ children }: { children: React.ReactNode }) {
    if (shouldSuspend) {
      throw boundary;
    }

    return <>{children}</>;
  }

  function ChatStateProbe() {
    const { messages, status, error } = useChat({
      chat,
      requiresSearch: false,
    });
    const text = messages
      .flatMap((message) => message.parts)
      .map((part) => ('text' in part ? part.text : ''))
      .join('');

    return (
      <span data-chat-state>{`${text}|${status}|${
        error?.message ?? 'none'
      }`}</span>
    );
  }

  const app = (
    <InstantSearchSSRProvider initialResults={{}}>
      <InstantSearch searchClient={searchClient} indexName="indexName">
        <React.Suspense fallback={<span>Loading</span>}>
          <DelayedBoundary>
            <ChatStateProbe />
          </DelayedBoundary>
        </React.Suspense>
      </InstantSearch>
    </InstantSearchSSRProvider>
  );

  const html = await new Promise<string>((resolve, reject) => {
    const destination = new PassThrough();
    const chunks: Buffer[] = [];
    destination.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    destination.on('end', () =>
      resolve(Buffer.concat(chunks).toString('utf8'))
    );
    destination.on('error', reject);

    const { pipe } = renderToPipeableStream(app, {
      onShellReady() {
        // The chat advances and fails while the boundary is still pending.
        chat._state.status = 'error';
        chat._state.error = new Error('Live failure');
        chat.messages = [
          {
            id: 'live-assistant',
            role: 'assistant',
            parts: [{ type: 'text', text: 'Live answer' }],
          },
        ];
        shouldSuspend = false;
        releaseBoundary();
        pipe(destination);
      },
      onError: reject,
    });
  });

  // Messages, status and error must describe one revision. Freezing messages
  // while letting status and error run live produces a tuple that never
  // existed, and the hydrating client starts from a different one.
  expect(html).toContain('Captured answer|ready|none');
});
