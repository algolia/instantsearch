import historyRouter from '../history';
import { wait } from '../../../../test/utils/wait';

describe('life cycle', () => {
  beforeEach(() => {
    window.history.pushState(null, '-- divider --', 'http://localhost/');
    jest.restoreAllMocks();
  });

  it('writes after timeout is done', async () => {
    const pushState = jest.spyOn(window.history, 'pushState');

    const router = historyRouter<{ some: string }>({
      writeDelay: 0,
    });

    router.write({ some: 'state' });
    router.write({ some: 'second' });
    router.write({ some: 'third' });
    await wait(0);

    expect(pushState).toHaveBeenCalledTimes(1);
    expect(pushState.mock.calls).toMatchInlineSnapshot(`
      [
        [
          {
            "some": "third",
          },
          "",
          "http://localhost/?some=third",
        ],
      ]
    `);
  });

  it('browser back/forward behavior', async () => {
    const pushState = jest.spyOn(window.history, 'pushState');

    const router = historyRouter<{ some: string }>({
      writeDelay: 0,
    });
    // router.write always calling after onUpdate method
    router.onUpdate((routeState) => {
      router.write(routeState);
    });

    const popStateEvent = new PopStateEvent('popstate', { state: { step: 2 } });
    dispatchEvent(popStateEvent);
    await wait(0);
    expect(pushState).toHaveBeenCalledTimes(0);
  });
});
