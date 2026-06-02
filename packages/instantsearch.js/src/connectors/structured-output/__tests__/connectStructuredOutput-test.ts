/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import algoliasearchHelper from 'algoliasearch-helper';

import { createInitOptions } from '../../../../test/createWidget';
import connectStructuredOutput from '../connectStructuredOutput';

import type {
  StructuredOutputConnectorParams,
  StructuredOutputRenderState,
} from '../connectStructuredOutput';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const stringToUint8Array = (str: string): Uint8Array => {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i);
  }
  return arr;
};

const createMockStream = (lines: string[]): ReadableStream<Uint8Array> => {
  let index = 0;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    getReader: () => ({
      read: () =>
        index < lines.length
          ? Promise.resolve({
              done: false,
              value: stringToUint8Array(lines[index++]),
            })
          : Promise.resolve({ done: true, value: undefined }),
      releaseLock: () => {},
    }),
  } as ReadableStream<Uint8Array>;
};

describe('connectStructuredOutput', () => {
  const getInitializedWidget = (
    widgetParams: Partial<StructuredOutputConnectorParams> = {}
  ) => {
    const renderFn = jest.fn();
    const unmountFn = jest.fn();
    const makeWidget = connectStructuredOutput(renderFn, unmountFn);
    const widget = makeWidget({
      agentId: 'agentId',
      task: 'on_page_suggestions',
      ...widgetParams,
    });

    const helper = algoliasearchHelper(createSearchClient(), 'indexName');
    widget.init(createInitOptions({ helper }));

    const getRenderState = (): StructuredOutputRenderState =>
      renderFn.mock.calls[renderFn.mock.calls.length - 1][0];

    return { widget, helper, renderFn, unmountFn, getRenderState };
  };

  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        // @ts-expect-error
        connectStructuredOutput()({ task: 'x' });
      }).toThrow(/The render function is not valid/);
    });

    it('throws without task', () => {
      expect(() => {
        connectStructuredOutput(jest.fn())({} as StructuredOutputConnectorParams);
      }).toThrow('The `task` option is required.');
    });

    it('throws without agentId or transport', () => {
      expect(() => {
        connectStructuredOutput(jest.fn())({ task: 'on_page_suggestions' });
      }).toThrow(
        'The `agentId` option is required unless a custom `transport` is provided.'
      );
    });

    it('is a widget', () => {
      const widget = connectStructuredOutput(jest.fn())({
        agentId: 'agentId',
        task: 'on_page_suggestions',
      });

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.structuredOutput',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),
        })
      );
    });
  });

  describe('submit (non-streaming)', () => {
    it('posts { task, variables } to the structured-outputs endpoint', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ output: { suggestions: ['a'] } }),
        })
      ) as jest.Mock;

      const { getRenderState } = getInitializedWidget();
      getRenderState().submit({ contextType: 'pdp', objectID: '1' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          '/agent-studio/1/agents/agentId/structured-outputs?stream=false'
        ),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            task: 'on_page_suggestions',
            variables: { contextType: 'pdp', objectID: '1' },
          }),
        })
      );

      await flush();

      expect(getRenderState().output).toEqual({ suggestions: ['a'] });
      expect(getRenderState().isLoading).toBe(false);
      expect(getRenderState().error).toBeNull();
    });

    it('exposes the error on failure', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({ ok: false, status: 502 })
      ) as jest.Mock;

      const { getRenderState } = getInitializedWidget();
      getRenderState().submit({});

      await flush();

      expect(getRenderState().output).toBeNull();
      expect(getRenderState().error).toEqual(new Error('HTTP error 502'));
      expect(getRenderState().isLoading).toBe(false);
    });
  });

  describe('submit (streaming)', () => {
    it('replaces output with each NDJSON snapshot', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          body: createMockStream([
            '{"suggestions":["a"]}\n',
            '{"suggestions":["a","b"]}\n',
          ]),
        })
      ) as jest.Mock;

      const { getRenderState } = getInitializedWidget({ stream: true });

      expect(global.fetch).not.toHaveBeenCalled();
      getRenderState().submit({});

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('structured-outputs?stream=true'),
        expect.anything()
      );

      await flush();

      expect(getRenderState().output).toEqual({ suggestions: ['a', 'b'] });
      expect(getRenderState().isLoading).toBe(false);
    });
  });

  describe('custom transport', () => {
    it('uses the transport api and prepareRequest', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ output: {} }),
        })
      ) as jest.Mock;

      const { getRenderState } = getInitializedWidget({
        agentId: undefined,
        transport: {
          api: 'https://example.test/structured',
          headers: { 'x-custom': '1' },
          prepareRequest: (body) => ({ body: { ...body, extra: true } }),
        },
      });

      getRenderState().submit({ a: 1 });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.test/structured',
        expect.objectContaining({
          headers: expect.objectContaining({ 'x-custom': '1' }),
          body: JSON.stringify({
            task: 'on_page_suggestions',
            variables: { a: 1 },
            extra: true,
          }),
        })
      );

      await flush();
    });
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const { widget, unmountFn } = getInitializedWidget();
      widget.dispose!();
      expect(unmountFn).toHaveBeenCalledTimes(1);
    });
  });
});
