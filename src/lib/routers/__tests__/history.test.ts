import historyRouter from '../history';

const wait = (ms = 0) => new Promise(res => setTimeout(res, ms));

describe('life cycle', () => {
  it('does not write the same url twice', async () => {
    const router = historyRouter({
      writeDelay: 0,
    });

    const spy = jest.spyOn(window.history, 'pushState');

    router.write({ some: 'state' });
    await wait(0);
    router.write({ some: 'state' });
    await wait(0);
    router.write({ some: 'state' });
    await wait(0);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
