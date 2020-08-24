export const ANONYMOUS_TOKEN = 'anonymous-user-id-1';

export function createAlgoliaAnalytics() {
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
  const _get = (key, callback) => callback(values[key]);
  const onUserTokenChange = (callback, { immediate = false } = {}) => {
    userTokenCallback = callback;
    if (immediate) {
      callback(values._userToken);
    }
  };

  return {
    setUserToken,
    init,
    _get,
    onUserTokenChange,
    viewedObjectIDs: jest.fn(),
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

export function createInsightsUmdVersion() {
  const globalObject: any = {};
  globalObject.aa = (...args) => {
    globalObject.aa.queue = globalObject.aa.queue || [];
    globalObject.aa.queue.push(args);
  };

  return {
    insightsClient: globalObject.aa,
    libraryLoadedAndProcessQueue: () => {
      const instance = createAlgoliaAnalytics();
      const _aa = createInsightsClient(instance);
      const queue = globalObject.aa.queue;
      queue.forEach(([methodName, ...args]) => {
        _aa(methodName, ...args);
      });
      queue.push = ([methodName, ...args]) => {
        _aa(methodName, ...args);
      };
    },
  };
}
