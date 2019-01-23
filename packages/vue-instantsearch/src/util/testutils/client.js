export const createFakeClient = () => ({
  search: jest.fn(requests =>
    Promise.resolve({
      results: requests.map(({ params: { query } }) => ({ query })),
    })
  ),
});
