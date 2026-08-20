/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { fetchTask } from '..';

describe('fetchTask compatibility', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('performs one request and returns the response envelope', async () => {
    const envelope = { output: { suggestions: ['one'] } };
    const fetchMock = jest.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify(envelope), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    global.fetch = jest.fn();

    await expect(
      fetchTask({
        endpoint: 'https://example.test/tasks',
        headers: { 'x-custom': 'yes' },
        payload: { task: 'recommend', input: { query: 'shoes' } },
        fetch: fetchMock,
        stream: false,
      })
    ).resolves.toEqual(envelope);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('https://example.test/tasks', {
      method: 'POST',
      credentials: undefined,
      headers: {
        'x-custom': 'yes',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: 'recommend',
        input: { query: 'shoes' },
      }),
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
