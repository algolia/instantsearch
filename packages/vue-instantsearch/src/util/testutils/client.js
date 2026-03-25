export const createFakeClient = () => ({
  search: vi.fn((requests) =>
    Promise.resolve({
      results: requests.map(({ params: { query } }) => ({ query })),
    })
  ),
});
