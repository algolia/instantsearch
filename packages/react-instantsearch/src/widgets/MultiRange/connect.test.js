/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connect';
jest.mock('../../core/createConnector');

const {
  getProps,
  refine,
  getSearchParameters: getSP,
  getMetadata,
} = connect;

let props;
let params;

describe('MultiRange.connect', () => {
  it('provides the correct props to the component', () => {
    props = getProps({
      items: [
        {label: 'All'},
      ],
    }, {});
    expect(props).toEqual({
      items: [
        {label: 'All', value: ''},
      ],
      selectedItem: '',
    });

    props = getProps({
      items: [
        {label: 'All'},
        {label: 'Ok', start: 100},
      ],
    }, {});
    expect(props).toEqual({
      items: [
        {label: 'All', value: ''},
        {label: 'Ok', value: '100:'},
      ],
      selectedItem: '',
    });

    props = getProps({
      items: [
        {label: 'All'},
        {label: 'Not ok', end: 200},
      ],
    }, {});
    expect(props).toEqual({
      items: [
        {label: 'All', value: ''},
        {label: 'Not ok', value: ':200'},
      ],
      selectedItem: '',
    });

    props = getProps({
      items: [
        {label: 'All'},
        {label: 'Ok', start: 100},
        {label: 'Not ok', end: 200},
        {label: 'Maybe ok?', start: 100, end: 200},
      ],
    }, {});
    expect(props).toEqual({
      items: [
        {label: 'All', value: ''},
        {label: 'Ok', value: '100:'},
        {label: 'Not ok', value: ':200'},
        {label: 'Maybe ok?', value: '100:200'},
      ],
      selectedItem: '',
    });

    props = getProps({id: 'ok', items: []}, {ok: 'wat'});
    expect(props).toEqual({items: [], selectedItem: 'wat'});

    props = getProps({attributeName: 'ok', items: []}, {ok: 'wat'});
    expect(props).toEqual({items: [], selectedItem: 'wat'});

    props = getProps({id: 'ok', items: [], defaultSelectedItem: 'wat'}, {});
    expect(props).toEqual({items: [], selectedItem: 'wat'});
  });

  it('calling refine updates the widget\'s state', () => {
    const nextState = refine({id: 'ok'}, {otherKey: 'val'}, 'yep');
    expect(nextState).toEqual({
      otherKey: 'val',
      ok: 'yep',
    });
  });

  it('refines the corresponding numeric facet', () => {
    const initSP = new SearchParameters();

    params = getSP(initSP, {attributeName: 'facet'}, {facet: ''});
    expect(params.getNumericRefinements('facet')).toEqual({});

    params = getSP(initSP, {attributeName: 'facet'}, {facet: '100:'});
    expect(params.getNumericRefinements('facet')).toEqual({
      '>=': [100],
    });

    params = getSP(initSP, {attributeName: 'facet'}, {facet: ':200'});
    expect(params.getNumericRefinements('facet')).toEqual({
      '<=': [200],
    });

    params = getSP(initSP, {attributeName: 'facet'}, {facet: '100:200'});
    expect(params.getNumericRefinements('facet')).toEqual({
      '>=': [100],
      '<=': [200],
    });
  });

  it('registers its id in metadata', () => {
    const metadata = getMetadata({id: 'ok'}, {});
    expect(metadata).toEqual({id: 'ok', filters: []});
  });

  it('registers its filter in metadata', () => {
    const metadata = getMetadata(
      {
        attributeName: 'wot',
        items: [{
          label: 'YAY',
          start: 100,
          end: 200,
        }],
      },
      {wot: '100:200'}
    );
    expect(metadata).toEqual({
      id: 'wot',
      filters: [{
        key: 'wot.100:200',
        label: 'wot: YAY',
        // Ignore clear, we test it later
        clear: metadata.filters[0].clear,
      }],
    });

    const state = metadata.filters[0].clear({wot: '100:200'});
    expect(state).toEqual({wot: ''});
  });
});
