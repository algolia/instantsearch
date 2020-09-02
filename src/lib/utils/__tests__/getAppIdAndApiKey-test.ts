import { getAppIdAndApiKey } from '../getAppIdAndApiKey';
import algoliasearchV4 from 'algoliasearch';
import algoliasearchV3 from 'algoliasearch-v3';

const APP_ID = 'myAppId';
const API_KEY = 'myApiKey';

describe('getAppIdAndApiKey', () => {
  it('gets appId and apiKey from searchClient@v4', () => {
    const searchClient = algoliasearchV4(APP_ID, API_KEY);
    const [appId, apiKey] = getAppIdAndApiKey(searchClient);
    expect(appId).toEqual(APP_ID);
    expect(apiKey).toEqual(API_KEY);
  });

  it('gets appId and apiKey from searchClient@v3', () => {
    const searchClient = algoliasearchV3(APP_ID, API_KEY);
    const [appId, apiKey] = getAppIdAndApiKey(searchClient);
    expect(appId).toEqual(APP_ID);
    expect(apiKey).toEqual(API_KEY);
  });
});
