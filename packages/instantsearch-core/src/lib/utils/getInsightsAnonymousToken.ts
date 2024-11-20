export const ANONYMOUS_TOKEN_COOKIE_KEY = '_ALGOLIA';

function getCookie(name: string): string | undefined {
  if (typeof document !== 'object' || typeof document.cookie !== 'string') {
    return undefined;
  }

  const prefix = `${name}=`;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(prefix) === 0) {
      return cookie.substring(prefix.length, cookie.length);
    }
  }
  return undefined;
}

export function getInsightsAnonymousUserToken(): string | undefined {
  return getCookie(ANONYMOUS_TOKEN_COOKIE_KEY);
}
