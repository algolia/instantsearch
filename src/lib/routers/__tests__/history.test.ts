import historyRouter from '../history';

const wait = (ms = 0) => new Promise(res => setTimeout(res, ms));

describe('life cycle', () => {
  beforeEach(() => {
    window.history.pushState(null, '-- divider --', 'http://localhost/');
    jest.restoreAllMocks();
  });

  it('does not write the same url twice', async () => {
    const pushState = jest.spyOn(window.history, 'pushState');
    const router = historyRouter({
      writeDelay: 0,
    });

    router.write({ some: 'state' });
    await wait(0);

    router.write({ some: 'state' });
    await wait(0);

    router.write({ some: 'state' });
    await wait(0);

    expect(pushState).toHaveBeenCalledTimes(1);
  });

  it('does not write the same url title twice', async () => {
    const title = jest.spyOn(window.document, 'title', 'set');
    const pushState = jest.spyOn(window.history, 'pushState');

    const router = historyRouter({
      writeDelay: 0,
      windowTitle: state => `My Site - ${state.some}`,
    });

    expect(title).toHaveBeenCalledTimes(1);
    expect(window.document.title).toBe('My Site - undefined');

    router.write({ some: 'state' });
    await wait(0);

    router.write({ some: 'state' });
    await wait(0);

    router.write({ some: 'state' });
    await wait(0);

    expect(pushState).toHaveBeenCalledTimes(1);

    expect(title).toHaveBeenCalledTimes(2);
    expect(window.document.title).toBe('My Site - state');
  });

  it('writes after timeout is done', async () => {
    const pushState = jest.spyOn(window.history, 'pushState');

    const router = historyRouter({
      writeDelay: 0,
    });

    router.write({ some: 'state' });
    router.write({ some: 'second' });
    router.write({ some: 'third' });
    await wait(0);

    expect(pushState).toHaveBeenCalledTimes(1);
  });
});
