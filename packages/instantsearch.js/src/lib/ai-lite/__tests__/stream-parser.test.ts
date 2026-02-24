/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { parseJsonEventStream, processStream } from '../stream-parser';

import type { UIMessageChunk } from '../types';

describe('stream-parser', () => {
  describe('parseJsonEventStream', () => {
    // Helper to create a mock ReadableStream from chunks
    const createMockStream = (
      chunks: Uint8Array[]
    ): ReadableStream<Uint8Array> => {
      let index = 0;
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return {
        getReader: () => ({
          read: () => {
            if (index < chunks.length) {
              return Promise.resolve({
                done: false,
                value: chunks[index++],
              });
            }
            return Promise.resolve({ done: true, value: undefined });
          },
          releaseLock: () => {},
        }),
      } as ReadableStream<Uint8Array>;
    };

    const stringToUint8Array = (str: string): Uint8Array => {
      const arr = new Uint8Array(str.length);
      for (let i = 0; i < str.length; i++) {
        arr[i] = str.charCodeAt(i);
      }
      return arr;
    };

    const collectChunks = (
      stream: ReadableStream<UIMessageChunk>
    ): Promise<UIMessageChunk[]> =>
      new Promise((resolve, reject) => {
        const chunks: UIMessageChunk[] = [];
        processStream<UIMessageChunk>(
          stream,
          (chunk) => {
            chunks.push(chunk);
          },
          () => resolve(chunks),
          (error) => reject(error)
        );
      });

    it('should parse SSE format with data: prefix', () => {
      const stream = createMockStream([
        stringToUint8Array('data: {"type":"start","messageId":"123"}\n'),
        stringToUint8Array('data: {"type":"text-start","id":"t1"}\n'),
        stringToUint8Array(
          'data: {"type":"text-delta","delta":"Hello","id":"t1"}\n'
        ),
        stringToUint8Array('data: {"type":"text-end","id":"t1"}\n'),
        stringToUint8Array('data: {"type":"finish"}\n'),
      ]);

      const parsedStream = parseJsonEventStream(stream);
      return collectChunks(parsedStream).then((chunks) => {
        expect(chunks).toHaveLength(5);
        expect(chunks[0]).toEqual({ type: 'start', messageId: '123' });
        expect(chunks[1]).toEqual({ type: 'text-start', id: 't1' });
        expect(chunks[2]).toEqual({
          type: 'text-delta',
          delta: 'Hello',
          id: 't1',
        });
        expect(chunks[3]).toEqual({ type: 'text-end', id: 't1' });
        expect(chunks[4]).toEqual({ type: 'finish' });
      });
    });

    it('should parse plain NDJSON format', () => {
      const stream = createMockStream([
        stringToUint8Array('{"type":"start","messageId":"123"}\n'),
        stringToUint8Array('{"type":"text-delta","delta":"World","id":"t1"}\n'),
        stringToUint8Array('{"type":"finish"}\n'),
      ]);

      const parsedStream = parseJsonEventStream(stream);
      return collectChunks(parsedStream).then((chunks) => {
        expect(chunks).toHaveLength(3);
        expect(chunks[0]).toEqual({ type: 'start', messageId: '123' });
        expect(chunks[1]).toEqual({
          type: 'text-delta',
          delta: 'World',
          id: 't1',
        });
        expect(chunks[2]).toEqual({ type: 'finish' });
      });
    });

    it('should handle SSE [DONE] termination signal', () => {
      const stream = createMockStream([
        stringToUint8Array('data: {"type":"start","messageId":"123"}\n'),
        stringToUint8Array('data: {"type":"finish"}\n'),
        stringToUint8Array('data: [DONE]\n'),
      ]);

      const parsedStream = parseJsonEventStream(stream);
      return collectChunks(parsedStream).then((chunks) => {
        expect(chunks).toHaveLength(2);
        expect(chunks[0]).toEqual({ type: 'start', messageId: '123' });
        expect(chunks[1]).toEqual({ type: 'finish' });
      });
    });

    it('should skip empty lines', () => {
      const stream = createMockStream([
        stringToUint8Array('data: {"type":"start","messageId":"123"}\n'),
        stringToUint8Array('\n'),
        stringToUint8Array('\n'),
        stringToUint8Array('data: {"type":"finish"}\n'),
      ]);

      const parsedStream = parseJsonEventStream(stream);
      return collectChunks(parsedStream).then((chunks) => {
        expect(chunks).toHaveLength(2);
      });
    });

    it('should skip malformed JSON lines', () => {
      const stream = createMockStream([
        stringToUint8Array('data: {"type":"start","messageId":"123"}\n'),
        stringToUint8Array('data: {invalid json}\n'),
        stringToUint8Array('data: {"type":"finish"}\n'),
      ]);

      const parsedStream = parseJsonEventStream(stream);
      return collectChunks(parsedStream).then((chunks) => {
        expect(chunks).toHaveLength(2);
        expect(chunks[0]).toEqual({ type: 'start', messageId: '123' });
        expect(chunks[1]).toEqual({ type: 'finish' });
      });
    });

    it('should skip SSE event and id fields', () => {
      const stream = createMockStream([
        stringToUint8Array('event: message\n'),
        stringToUint8Array('id: 1\n'),
        stringToUint8Array('data: {"type":"start","messageId":"123"}\n'),
        stringToUint8Array('\n'),
        stringToUint8Array('event: message\n'),
        stringToUint8Array('id: 2\n'),
        stringToUint8Array('data: {"type":"finish"}\n'),
      ]);

      const parsedStream = parseJsonEventStream(stream);
      return collectChunks(parsedStream).then((chunks) => {
        expect(chunks).toHaveLength(2);
      });
    });

    it('should handle chunked data that splits across messages', () => {
      const stream = createMockStream([
        stringToUint8Array('data: {"type":"star'),
        stringToUint8Array('t","messageId":"123"}\n'),
        stringToUint8Array('data: {"type":"finish"}\n'),
      ]);

      const parsedStream = parseJsonEventStream(stream);
      return collectChunks(parsedStream).then((chunks) => {
        expect(chunks).toHaveLength(2);
        expect(chunks[0]).toEqual({ type: 'start', messageId: '123' });
        expect(chunks[1]).toEqual({ type: 'finish' });
      });
    });

    it('should handle data: with extra whitespace', () => {
      const stream = createMockStream([
        stringToUint8Array('data:   {"type":"start","messageId":"123"}\n'),
        stringToUint8Array('data:{"type":"finish"}\n'),
      ]);

      const parsedStream = parseJsonEventStream(stream);
      return collectChunks(parsedStream).then((chunks) => {
        expect(chunks).toHaveLength(2);
        expect(chunks[0]).toEqual({ type: 'start', messageId: '123' });
        expect(chunks[1]).toEqual({ type: 'finish' });
      });
    });
  });
});
