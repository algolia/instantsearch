/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

import createConfigManager from './createConfigManager';
jest.unmock('./createConfigManager');

// setQuery resets the page to 0, so we need to always run it before setPage
const conf1 = state => state.setQuery('wow');
const conf2 = state => state.setPage(10);

describe('createConfigManager', () => {
  it('lets you register configs', () => {
    const configManager = createConfigManager();
    configManager.register(conf1);
    configManager.register(conf2);
    const state = configManager.getState(new SearchParameters());
    expect(state.page).toBe(10);
    expect(state.query).toBe('wow');
  });

  it('lets you unregister configs', () => {
    const configManager = createConfigManager();
    configManager.register(conf1);
    configManager.unregister(conf1);
    const state = configManager.getState(new SearchParameters());
    expect(state.query).toBe('');
  });

  it('lets you swap configs', () => {
    const configManager = createConfigManager();
    configManager.register(conf1);
    configManager.swap(conf1, conf2);
    const state = configManager.getState(new SearchParameters());
    expect(state.page).toBe(10);
    expect(state.query).toBe('');
  });

  it('applies configs on the provided state', () => {
    const configManager = createConfigManager();
    const initialState = new SearchParameters().setHitsPerPage(666);
    configManager.register(conf1);
    configManager.register(conf2);
    const state = configManager.getState(initialState);
    expect(state.page).toBe(10);
    expect(state.query).toBe('wow');
    expect(state.hitsPerPage).toBe(666);
  });

  it('provides the result of the previous config to the next', () => {
    const configManager = createConfigManager();
    const initialState = new SearchParameters().setHitsPerPage(666);
    const conf3 = state =>
      state.query === 'wow' ?
        state.setQuery('WOW') :
        state;
    configManager.register(conf1);
    configManager.register(conf3);
    const state = configManager.getState(initialState);
    expect(state.query).toBe('WOW');
  });

  it('batches updates', () => {
    const onApply = jest.fn();
    const configManager = createConfigManager(onApply);
    configManager.register(conf1);
    configManager.register(conf2);
    configManager.apply();
    configManager.apply();
    expect(onApply.mock.calls.length).toBe(1);
    configManager.swap(conf1, conf2);
    configManager.swap(conf2, conf1);
    configManager.apply();
    configManager.apply();
    expect(onApply.mock.calls.length).toBe(2);
    configManager.register(conf1);
    configManager.swap(conf1, conf2);
    configManager.apply();
    configManager.apply();
    expect(onApply.mock.calls.length).toBe(3);
  });
});
