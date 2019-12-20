export const ANONYMOUS_TOKEN_COOKIE_KEY = '_ALGOLIA';

function getCookie(name: string): string {
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
  return '';
}

export default function getInsightsAnonymousUserToken(): string | null {
  const anonymousUserToken = getCookie(ANONYMOUS_TOKEN_COOKIE_KEY);
  return anonymousUserToken || null;
}
