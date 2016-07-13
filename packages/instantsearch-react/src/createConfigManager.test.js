/* eslint-env jest, jasmine */

import createConfigManager from './createConfigManager';
jest.unmock('./createConfigManager');
jest.unmock('lodash/array/union');

function testConcats(key) {
  const configManager = createConfigManager();
  configManager.register({[key]: ['foo']});
  configManager.register({[key]: ['bar']});
  const state = configManager.getState({[key]: []});
  // Order doesn't matter (for now)
  expect(state[key]).toContain('foo');
  expect(state[key]).toContain('bar');
}

function testDedupes(key) {
  const configManager = createConfigManager();
  configManager.register({[key]: ['foo']});
  configManager.register({[key]: ['foo']});
  const state = configManager.getState({[key]: []});
  expect(state[key]).toEqual(['foo']);
}

describe('createConfigManager', () => {
  it('concats facets', () => testConcats('facets'));

  it('dedupes facets', () => testDedupes('facets'));

  it('concats disjunctiveFacets', () => testConcats('disjunctiveFacets'));

  it('dedupes disjunctiveFacets', () => testDedupes('disjunctiveFacets'));

  it('concats hierarchicalFacets', () => testConcats('hierarchicalFacets'));

  it('dedupes hierarchicalFacets', () => testDedupes('hierarchicalFacets'));

  it('merges numericRefinements', () => {
    const configManager = createConfigManager();
    configManager.register({numericRefinements: {foo: true}});
    configManager.register({numericRefinements: {bar: true}});
    expect(configManager.getState({})).toEqual({
      numericRefinements: {
        foo: true,
        bar: true,
      },
    });
  });

  it('maxes out maxValuesPerFacet', () => {
    const configManager = createConfigManager();
    configManager.register({valuesPerFacet: 10});
    configManager.register({valuesPerFacet: 30});
    configManager.register({valuesPerFacet: 20});
    expect(configManager.getState({maxValuesPerFacet: 0}).maxValuesPerFacet).toEqual(30);
  });

  it('sets hitsPerPage', () => {
    const configManager = createConfigManager();
    configManager.register({hitsPerPage: 10});
    expect(configManager.getState({}).hitsPerPage).toEqual(10);
  });

  it('defaults hitsPerPage', () => {
    const configManager = createConfigManager();
    configManager.register({defaultHitsPerPage: 10});
    expect(configManager.getState({}).hitsPerPage).toEqual(10);
    expect(configManager.getState({hitsPerPage: 20}).hitsPerPage).toEqual(20);
  });

  it('lets you unregister configs', () => {
    const configManager = createConfigManager();
    const conf = {hitsPerPage: 10};
    configManager.register(conf);
    configManager.unregister(conf);
    const state = configManager.getState({});
    expect(state.hitsPerPage).toBe(undefined);
  });

  it('lets you swap configs', () => {
    const configManager = createConfigManager();
    const conf1 = {hitsPerPage: 10};
    const conf2 = {facets: ['foo']};
    configManager.register(conf1);
    configManager.swap(conf1, conf2);
    const state = configManager.getState({facets: []});
    expect(state.hitsPerPage).toBe(undefined);
    expect(state.facets).toEqual(['foo']);
  });

  it('throws when hitsPerPage is used alongside defaultHitsPerPage', () => {
    const configManager = createConfigManager();
    const conf1 = {hitsPerPage: 10};
    const conf2 = {defaultHitsPerPage: 10};
    const conf3 = {};
    configManager.register(conf1);
    expect(() =>
      configManager.register(conf2)
    ).toThrow();

    expect(() =>
      configManager.swap(conf1, conf2)
    ).not.toThrow();
    expect(() =>
      configManager.swap(conf2, conf1)
    ).not.toThrow();

    configManager.swap(conf1, conf2);
    expect(() =>
      configManager.register(conf1)
    ).toThrow();

    configManager.register(conf3);
    expect(() =>
      configManager.swap(conf3, conf1)
    ).toThrow();
    configManager.swap(conf2, conf1);
    expect(() =>
      configManager.swap(conf3, conf2)
    ).toThrow();
  });

  it('batches updates', () => {
    const onApply = jest.fn();
    const configManager = createConfigManager(onApply);
    const conf1 = {};
    const conf2 = {};
    const conf3 = {};
    const conf4 = {};
    configManager.register(conf1);
    configManager.register(conf2);
    configManager.apply();
    configManager.apply();
    expect(onApply.mock.calls.length).toBe(1);
    configManager.swap(conf1, conf3);
    configManager.swap(conf2, conf1);
    configManager.apply();
    configManager.apply();
    expect(onApply.mock.calls.length).toBe(2);
    configManager.register(conf2);
    configManager.swap(conf3, conf4);
    configManager.apply();
    configManager.apply();
    expect(onApply.mock.calls.length).toBe(3);
  });
});
