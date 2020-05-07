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
    expect(pushState.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "some": "state",
          },
          "",
          "http://localhost/?some=state",
        ],
      ]
    `);
  });

  it('does not write if already externally updated to desired URL', async () => {
    const pushState = jest.spyOn(window.history, 'pushState');
    const router = historyRouter({
      writeDelay: 0,
    });

    const fakeState = { identifier: 'fake state' };

    router.write({ some: 'state one' });

    // external update before timeout passes
    window.history.pushState(
      fakeState,
      '',
      'http://localhost/?some=state%20two'
    );

    // this write isn't needed anymore
    router.write({ some: 'state two' });
    await wait(0);

    expect(pushState).toHaveBeenCalledTimes(1);
    expect(pushState.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "identifier": "fake state",
          },
          "",
          "http://localhost/?some=state%20two",
        ],
      ]
    `);

    // proves that InstantSearch' write did not happen
    expect(history.state).toBe(fakeState);
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
    expect(pushState.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "some": "state",
          },
          "My Site - state",
          "http://localhost/?some=state",
        ],
      ]
    `);

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
    expect(pushState.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "some": "third",
          },
          "",
          "http://localhost/?some=third",
        ],
      ]
    `);
  });
});
