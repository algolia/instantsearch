export const fakeClient = {
  search: jest.fn(requests =>
    Promise.resolve({
      results: requests.map(({ params: { query } }) => ({ query })),
    })
  ),
};
