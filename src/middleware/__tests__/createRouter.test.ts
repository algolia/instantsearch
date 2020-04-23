import { createRouter } from '../createRouter';
import { history } from '../../lib/routers';

describe('_initialUiState', () => {
  it('overrides empty', () => {
    const historyRouter = history();

    historyRouter.read = () => ({
      someIndex: {
        query: 'state',
      },
    });

    const router = createRouter({
      router: historyRouter,
    });

    const instantSearchInstance = {
      _initialUiState: {},
    };

    router({ instantSearchInstance });

    expect(instantSearchInstance._initialUiState).toEqual({
      someIndex: {
        query: 'state',
      },
    });
  });

  it('merges within index', () => {
    const historyRouter = history();

    historyRouter.read = () => ({
      someIndex: {
        query: 'state',
      },
    });

    const router = createRouter({
      router: historyRouter,
    });

    const instantSearchInstance = {
      _initialUiState: {
        someIndex: {
          page: 5,
        },
      },
    };

    router({ instantSearchInstance });

    expect(instantSearchInstance._initialUiState).toEqual({
      someIndex: {
        query: 'state',
        page: 5,
      },
    });
  });

  it('overrides within index', () => {
    const historyRouter = history();

    historyRouter.read = () => ({
      someIndex: {
        query: 'state',
      },
    });

    const router = createRouter({
      router: historyRouter,
    });

    const instantSearchInstance = {
      _initialUiState: {
        someIndex: {
          query: 'initial',
        },
      },
    };

    router({ instantSearchInstance });

    expect(instantSearchInstance._initialUiState).toEqual({
      someIndex: {
        query: 'state',
      },
    });
  });
});
