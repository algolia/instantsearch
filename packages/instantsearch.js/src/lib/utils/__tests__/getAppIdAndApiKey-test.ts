import algoliasearchV3 from 'algoliasearch-v3';
import algoliasearchV4 from 'algoliasearch-v4';
import { liteClient as algoliasearchV5 } from 'algoliasearch-v5/lite';

import { getAppIdAndApiKey } from '../getAppIdAndApiKey';

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

  it('gets appId and apiKey from searchClient@v5', () => {
    const searchClient = algoliasearchV5(APP_ID, API_KEY);
    const [appId, apiKey] = getAppIdAndApiKey(searchClient);
    expect(appId).toEqual(APP_ID);
    expect(apiKey).toEqual(API_KEY);
  });

  it('gets manually set applicationID and apiKey', () => {
    const searchClient = algoliasearchV4(APP_ID, API_KEY);
    (searchClient.transporter as any).queryParameters = {};
    (searchClient as any).applicationID = 'anotherAppId';
    (searchClient as any).apiKey = 'anotherApiKey';
    const [appId, apiKey] = getAppIdAndApiKey(searchClient);
    expect(appId).toEqual('anotherAppId');
    expect(apiKey).toEqual('anotherApiKey');
  });
});
