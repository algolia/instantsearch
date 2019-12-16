import connectConfigureUserToken, {
  getUserTokenFromCookie,
  USER_TOKEN_COOKIE_KEY,
  ANONYMOUS_TOKEN_COOKIE_KEY,
} from '../connectConfigureUserToken';
import instantsearch from '../../../lib/main';
import { createSearchClient } from '../../../../test/mock/createSearchClient';

const DAY = 86400000; /* 1 day in ms*/
const DATE_TOMORROW = new Date(Date.now() + DAY).toUTCString();
const DATE_YESTERDAY = new Date(Date.now() - DAY).toUTCString();

const resetCookies = () => {
  document.cookie = `${ANONYMOUS_TOKEN_COOKIE_KEY}=;expires=Thu, 01-Jan-1970 00:00:01 GMT;`;
  document.cookie = `${USER_TOKEN_COOKIE_KEY}=;expires=Thu, 01-Jan-1970 00:00:01 GMT;`;
};

describe('getUserTokenFromCookie', () => {
  beforeEach(() => {
    resetCookies();
  });

  it('should read user_token cookie if available and non-expired', () => {
    document.cookie = `${ANONYMOUS_TOKEN_COOKIE_KEY}=anonymous-uuid;expires=${DATE_TOMORROW};`;
    document.cookie = `${USER_TOKEN_COOKIE_KEY}=user-1;expires=${DATE_TOMORROW};`;
    expect(getUserTokenFromCookie()).toEqual('user-1');
  });

  it('should read anonymous cookie if user_token cookie is unavailabe', () => {
    document.cookie = `${ANONYMOUS_TOKEN_COOKIE_KEY}=anonymous-uuid;expires=${DATE_TOMORROW};`;
    expect(getUserTokenFromCookie()).toEqual('anonymous-uuid');
  });

  it('should read anonymous cookie if user_token cookie has expired', () => {
    document.cookie = `${ANONYMOUS_TOKEN_COOKIE_KEY}=anonymous-uuid;expires=${DATE_TOMORROW};`;
    document.cookie = `${USER_TOKEN_COOKIE_KEY}=anonymous-uuid;expires=${DATE_YESTERDAY};`;
    expect(getUserTokenFromCookie()).toEqual('anonymous-uuid');
  });

  it('should return null if no cookie available', () => {
    expect(getUserTokenFromCookie()).toEqual(null);
  });
  it('should return null if all cookies expired', () => {
    document.cookie = `${ANONYMOUS_TOKEN_COOKIE_KEY}=anonymous-uuid;expires=${DATE_YESTERDAY};`;
    document.cookie = `${USER_TOKEN_COOKIE_KEY}=anonymous-uuid;expires=${DATE_YESTERDAY};`;
    expect(getUserTokenFromCookie()).toEqual(null);
  });
});

describe('connectConfigureUserToken', () => {
  beforeEach(() => {
    resetCookies();
  });

  it('sets the userToken search parameter from anonymous cookie when user_token cookie not available', () => {
    document.cookie = `${ANONYMOUS_TOKEN_COOKIE_KEY}=anonymous-uuid;expires=${DATE_TOMORROW};`;

    const searchClient = createSearchClient();
    const search = instantsearch({
      indexName: 'indexName',
      searchClient,
    });
    const configureUserToken = connectConfigureUserToken();

    search.addWidgets([configureUserToken({})]);
    search.start();

    expect(searchClient.search).toHaveBeenCalledTimes(1);
    expect(searchClient.search).toHaveBeenCalledWith([
      {
        indexName: 'indexName',
        params: expect.objectContaining({
          userToken: 'anonymous-uuid',
        }),
      },
    ]);
  });

  it('sets the userToken search parameter from user_token cookie when available', () => {
    document.cookie = `${ANONYMOUS_TOKEN_COOKIE_KEY}=anonymous-uuid;expires=${DATE_TOMORROW};`;
    document.cookie = `${USER_TOKEN_COOKIE_KEY}=user-1;expires=${DATE_TOMORROW};`;

    const searchClient = createSearchClient();
    const search = instantsearch({
      indexName: 'indexName',
      searchClient,
    });
    const configureUserToken = connectConfigureUserToken();

    search.addWidgets([configureUserToken({})]);
    search.start();

    expect(searchClient.search).toHaveBeenCalledTimes(1);
    expect(searchClient.search).toHaveBeenCalledWith([
      {
        indexName: 'indexName',
        params: expect.objectContaining({
          userToken: 'user-1',
        }),
      },
    ]);
  });

  it('does not set the userToken when no cookies available', () => {
    const searchClient = createSearchClient();
    const search = instantsearch({
      indexName: 'indexName',
      searchClient,
    });
    const configureUserToken = connectConfigureUserToken();

    search.addWidgets([configureUserToken({})]);
    search.start();

    expect(searchClient.search).toHaveBeenCalledTimes(1);
    expect(searchClient.search).toHaveBeenCalledWith([
      {
        indexName: 'indexName',
        params: expect.not.objectContaining({
          userToken: expect.anything(),
        }),
      },
    ]);
  });
});
