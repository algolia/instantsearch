import algoliasearchHelper, {
  PlainSearchParameters,
} from 'algoliasearch-helper';
import { Unmounter, WidgetFactory } from '../../types';
import connectConfigure, {
  ConfigureRenderer,
  ConfigureConnectorParams,
} from '../configure/connectConfigure';

export type ConfigureUserTokenConnectorParams = {};

export type ConfigureUserTokenWidgetFactory<
  TConfigureUserTokenWidgetParams
> = WidgetFactory<
  ConfigureUserTokenConnectorParams & TConfigureUserTokenWidgetParams
>;

type ConfigureUserTokenConnector = <TConfigureUserTokenWidgetParams>(
  render?: ConfigureRenderer<ConfigureConnectorParams>,
  unmount?: Unmounter
) => ConfigureUserTokenWidgetFactory<TConfigureUserTokenWidgetParams>;

export const getCookie = (name: string): string => {
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
};

export const USER_TOKEN_COOKIE_KEY = 'alg_user_token';
export const ANONYMOUS_TOKEN_COOKIE_KEY = '_ALGOLIA';

export function getUserTokenFromCookie(): string | null {
  const anonymousToken = getCookie(ANONYMOUS_TOKEN_COOKIE_KEY);
  const userToken = getCookie(USER_TOKEN_COOKIE_KEY);
  if (userToken) {
    return userToken;
  }
  if (anonymousToken) {
    return anonymousToken;
  }
  return null;
}

const connectConfigureUserToken: ConfigureUserTokenConnector = (
  renderFn,
  unmountFn
) => {
  return () => {
    const userToken = getUserTokenFromCookie();
    const newParameters = userToken ? { userToken } : {};
    const searchParameters: PlainSearchParameters = {
      ...new algoliasearchHelper.SearchParameters(newParameters),
    };

    const makeConfigure = connectConfigure(renderFn, unmountFn);

    return {
      ...makeConfigure({ searchParameters }),
      $$type: 'ais.configureUserToken',
    };
  };
};

export default connectConfigureUserToken;
