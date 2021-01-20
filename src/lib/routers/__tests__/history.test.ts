import historyRouter from '../history';
import { wait } from '../../../../test/utils/wait';

describe('life cycle', () => {
  beforeEach(() => {
    window.history.pushState(null, '-- divider --', 'http://localhost/');
    jest.restoreAllMocks();
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
