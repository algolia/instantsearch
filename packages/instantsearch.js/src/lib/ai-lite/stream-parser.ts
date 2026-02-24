/**
 * Stream parser for parsing SSE (Server-Sent Events) streams.
 * The AI SDK 5 format uses SSE with JSON payloads prefixed by "data: ".
 */
import type { UIMessageChunk } from './types';

/**
 * Parse a stream of bytes as SSE (Server-Sent Events) and convert to UIMessageChunk events.
 * Handles the "data: " prefix used by the AI SDK 5 streaming format.
 *
 * @param stream - The input stream of raw bytes
 * @returns A ReadableStream of parsed UIMessageChunk events
 */
export function parseJsonEventStream(
  stream: ReadableStream<Uint8Array>
): ReadableStream<UIMessageChunk> {
  const decoder = new TextDecoder();
  let buffer = '';

  return new ReadableStream<UIMessageChunk>({
    start(controller) {
      const reader = stream.getReader();

      const processChunk = (): void => {
        reader.read().then(
          ({ done, value }) => {
            if (done) {
              // Process any remaining data in the buffer
              if (buffer.trim()) {
                const jsonData = extractJsonFromLine(buffer.trim());
                if (jsonData) {
                  try {
                    const chunk = JSON.parse(jsonData) as UIMessageChunk;
                    controller.enqueue(chunk);
                  } catch {
                    // Ignore parsing errors for incomplete data at end
                  }
                }
              }
              controller.close();
              return;
            }

            // Decode the chunk and add to buffer
            buffer += decoder.decode(value, { stream: true });

            // Process complete lines
            const lines = buffer.split('\n');
            // Keep the last potentially incomplete line in the buffer
            buffer = lines.pop() || '';

            for (let i = 0; i < lines.length; i++) {
              const trimmedLine = lines[i].trim();
              // eslint-disable-next-line no-continue
              if (!trimmedLine) continue;

              // Extract JSON from SSE data line or plain JSON
              const jsonData = extractJsonFromLine(trimmedLine);
              // eslint-disable-next-line no-continue
              if (!jsonData) continue;

              try {
                const chunk = JSON.parse(jsonData) as UIMessageChunk;
                controller.enqueue(chunk);
              } catch {
                // Skip malformed lines
              }
            }

            // Continue reading
            processChunk();
          },
          (error) => {
            controller.error(error);
          }
        );
      };

      processChunk();
    },
  });
}

/**
 * Extract JSON data from an SSE line or plain JSON line.
 * Handles both "data: {...}" SSE format and plain "{...}" NDJSON format.
 */
function extractJsonFromLine(line: string): string | null {
  // Handle SSE format: "data: {...}"
  if (line.startsWith('data:')) {
    const data = line.slice(5).trim();
    // Skip SSE stream termination signal
    if (data === '[DONE]') return null;
    return data;
  }

  // Handle plain JSON (NDJSON format)
  if (line.startsWith('{')) {
    return line;
  }

  // Skip other SSE fields (event:, id:, retry:, etc.)
  return null;
}

/**
 * Process a ReadableStream using a callback for each value.
 * This is a non-async alternative to for-await-of iteration.
 */
export function processStream<T>(
  stream: ReadableStream<T>,
  onChunk: (chunk: T) => void | Promise<void>,
  onDone: () => void,
  onError: (error: Error) => void
): void {
  const reader = stream.getReader();

  const read = (): void => {
    reader.read().then(
      ({ done, value }) => {
        if (done) {
          reader.releaseLock();
          onDone();
          return;
        }

        const result = onChunk(value);
        if (result && typeof result.then === 'function') {
          result.then(
            () => read(),
            (error) => {
              reader.releaseLock();
              onError(error as Error);
            }
          );
        } else {
          read();
        }
      },
      (error) => {
        reader.releaseLock();
        onError(error as Error);
      }
    );
  };

  read();
}
