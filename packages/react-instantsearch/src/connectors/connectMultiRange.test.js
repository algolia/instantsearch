/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectMultiRange';
jest.mock('../core/createConnector');

const {
  getProps,
  refine,
  getSearchParameters: getSP,
  getMetadata,
} = connect;

let props;
let params;

describe('connectMultiRange', () => {
  it('provides the correct props to the component', () => {
    props = getProps({
      items: [
        {label: 'All'},
      ],
    }, {});
    expect(props).toEqual({
      items: [
        {label: 'All', value: '', isRefined: true},
      ],
      currentRefinement: '',
    });

    props = getProps({
      items: [
        {label: 'All'},
        {label: 'Ok', start: 100},
      ],
    }, {});
    expect(props).toEqual({
      items: [
        {label: 'All', value: '', isRefined: true},
        {label: 'Ok', value: '100:', isRefined: false},
      ],
      currentRefinement: '',
    });

    props = getProps({
      items: [
        {label: 'All'},
        {label: 'Not ok', end: 200},
      ],
    }, {});
    expect(props).toEqual({
      items: [
        {label: 'All', value: '', isRefined: true},
        {label: 'Not ok', value: ':200', isRefined: false},
      ],
      currentRefinement: '',
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
        {label: 'All', value: '', isRefined: true},
        {label: 'Ok', value: '100:', isRefined: false},
        {label: 'Not ok', value: ':200', isRefined: false},
        {label: 'Maybe ok?', value: '100:200', isRefined: false},
      ],
      currentRefinement: '',
    });

    props = getProps({attributeName: 'ok', items: []}, {ok: 'wat'});
    expect(props).toEqual({items: [], currentRefinement: 'wat'});

    props = getProps({attributeName: 'ok', items: []}, {ok: 'wat'});
    expect(props).toEqual({items: [], currentRefinement: 'wat'});

    props = getProps({attributeName: 'ok', items: [], defaultRefinement: 'wat'}, {});
    expect(props).toEqual({items: [], currentRefinement: 'wat'});
  });

  it('calling refine updates the widget\'s state', () => {
    const nextState = refine({attributeName: 'ok'}, {otherKey: 'val'}, 'yep');
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
    const metadata = getMetadata({attributeName: 'ok'}, {});
    expect(metadata).toEqual({id: 'ok', items: []});
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
      items: [{
        label: 'wot: YAY',
        // Ignore clear, we test it later
        value: metadata.items[0].value,
        attributeName: 'wot',
        currentRefinement: 'YAY',
      }],
    });

    const state = metadata.items[0].value({wot: '100:200'});
    expect(state).toEqual({wot: ''});
  });
});
