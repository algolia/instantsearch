import { getHttpErrorMessageFromResponse } from '../transport';

function mockResponse({
  status,
  statusText,
  json,
}: {
  status: number;
  statusText: string;
  json: () => Promise<unknown>;
}): Response {
  return { status, statusText, json } as Response;
}

describe('getHttpErrorMessageFromResponse', () => {
  test('returns JSON message when present', async () => {
    const response = mockResponse({
      status: 400,
      statusText: 'Bad Request',
      json: () =>
        Promise.resolve({
          message:
            'Conversation has reached its maximum thread depth of 3 messages. Please start a new conversation.',
        }),
    });

    await expect(getHttpErrorMessageFromResponse(response)).resolves.toBe(
      'Conversation has reached its maximum thread depth of 3 messages. Please start a new conversation.'
    );
  });

  test('falls back to HTTP status when body is not JSON', async () => {
    const response = mockResponse({
      status: 502,
      statusText: 'Bad Gateway',
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    });

    await expect(getHttpErrorMessageFromResponse(response)).resolves.toBe(
      'HTTP error: 502 Bad Gateway'
    );
  });

  test('falls back when JSON has no usable message', async () => {
    const response = mockResponse({
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({ code: 'x' }),
    });

    await expect(getHttpErrorMessageFromResponse(response)).resolves.toBe(
      'HTTP error: 500 Internal Server Error'
    );
  });
});
