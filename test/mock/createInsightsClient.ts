export const ANONYMOUS_TOKEN = 'anonymous-user-id-1';

export type AlgoliaAnalytics = {
  setUserToken(userToken: string): void;
  init({ appId, apiKey }): void;
  getUserToken(
    options: any,
    callback: (error: any, userToken: string) => void
  ): void;
  onUserTokenChange(
    callback: (value: string) => void,
    options?: { immediate?: boolean }
  ): void;
  viewedObjectIDs(...args: any[]): void;
};

export function createAlgoliaAnalytics(): AlgoliaAnalytics {
  let values: any = {};
  const setValues = obj => {
    values = {
      ...values,
      ...obj,
    };
  };
  let userTokenCallback;
  const setUserToken = userToken => {
    setValues({ _userToken: userToken });
    if (userTokenCallback) {
      userTokenCallback(userToken);
    }
  };
  const init = ({ appId, apiKey }) => {
    setValues({ _hasCredentials: true, _appId: appId, _apiKey: apiKey });
    setUserToken(ANONYMOUS_TOKEN);
  };
  const getUserToken = (_options, callback) =>
    callback(null, values._userToken);
  const onUserTokenChange = (callback, { immediate = false } = {}) => {
    userTokenCallback = callback;
    if (immediate) {
      callback(values._userToken);
    }
  };
  const viewedObjectIDs = jest.fn();

  return {
    setUserToken,
    init,
    getUserToken,
    onUserTokenChange,
    viewedObjectIDs,
  };
}

export function createInsightsClient(instance = createAlgoliaAnalytics()) {
  return (methodName, ...args) => {
    if (!instance[methodName]) {
      throw new Error(`${methodName} doesn't exist in this mocked instance`);
    }
    instance[methodName](...args);
  };
}

export function createInsightsUmdVersion(
  algoliaAnalytics = createAlgoliaAnalytics()
) {
  const globalObject: any = {};
  globalObject.aa = (...args) => {
    globalObject.aa.queue = globalObject.aa.queue || [];
    globalObject.aa.queue.push(args);
  };

  return {
    insightsClient: globalObject.aa,
    libraryLoadedAndProcessQueue: () => {
      const _aa = createInsightsClient(algoliaAnalytics);
      const queue = globalObject.aa.queue;
      queue.forEach(([methodName, ...args]) => {
        _aa(methodName, ...args);
      });
      queue.push = ([methodName, ...args]) => {
        _aa(methodName, ...args);
      };
      return {
        algoliaAnalytics,
      };
    },
  };
}
