import getInsightsAnonymousUserToken, {
  ANONYMOUS_TOKEN_COOKIE_KEY,
} from '../get-insights-anonymous-user-token';
import { warning } from '../../lib/utils';

const DAY = 86400000; /* 1 day in ms*/
const DATE_TOMORROW = new Date(Date.now() + DAY).toUTCString();
const DATE_YESTERDAY = new Date(Date.now() - DAY).toUTCString();

const resetCookie = cookieKey => {
  document.cookie = `${cookieKey}=;expires=Thu, 01-Jan-1970 00:00:01 GMT;`;
};

describe('getInsightsAnonymousUserToken', () => {
  beforeEach(() => {
    resetCookie(ANONYMOUS_TOKEN_COOKIE_KEY);
  });

  it('should return undefined when no cookies', () => {
    expect(getInsightsAnonymousUserToken()).toBe(undefined);
  });

  it('should return undefined when cookie present but expired', () => {
    document.cookie = `${ANONYMOUS_TOKEN_COOKIE_KEY}=anonymous-uuid;expires=${DATE_YESTERDAY};`;
    expect(getInsightsAnonymousUserToken()).toBe(undefined);
  });

  it('should return the anonymous uuid when cookie present and valid', () => {
    document.cookie = `${ANONYMOUS_TOKEN_COOKIE_KEY}=anonymous-uuid;expires=${DATE_TOMORROW};`;
    expect(getInsightsAnonymousUserToken()).toBe('anonymous-uuid');
  });

  it('should return the anonymous uuid when other cookies are invalid', () => {
    document.cookie = `${ANONYMOUS_TOKEN_COOKIE_KEY}=anonymous-uuid;expires=${DATE_TOMORROW};`;
    document.cookie = `BAD_COOKIE=val%ue;expires=${DATE_TOMORROW};path=/`;
    expect(getInsightsAnonymousUserToken()).toBe('anonymous-uuid');
  });

  it('should show deprecation warning', () => {
    warning.cache = {};
    expect(() => {
      getInsightsAnonymousUserToken();
    })
      .toWarnDev(`[InstantSearch.js]: \`getInsightsAnonymousUserToken\` function has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the \`insights\` middleware.

For more information, visit https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/how-to/send-click-and-conversion-events-with-instantsearch/js/`);
  });
});
