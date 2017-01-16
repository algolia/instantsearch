/* eslint-env jest, jasmine */

import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectHitsPerPage';
jest.mock('../core/createConnector');

const {
  getProvidedProps,
  refine,
  getSearchParameters: getSP,
  getMetadata,
  cleanUp,
} = connect;

let props;
let params;

describe('connectHitsPerPage', () => {
  const items = [{label: '10', value: 10}, {label: '20', value: 20}];
  it('provides the correct props to the component', () => {
    props = getProvidedProps({items}, {hitsPerPage: '10'});
    expect(props).toEqual({
      currentRefinement: 10,
      items: [{label: '10', value: 10, isRefined: true}, {
        label: '20', value: 20, isRefined: false,
      }],
    });

    props = getProvidedProps({defaultRefinement: 20, items}, {});
    expect(props).toEqual({
      currentRefinement: 20,
      items: [{
        label: '10', value: 10, isRefined: false,
      }, {label: '20', value: 20, isRefined: true}],
    });

    const transformItems = jest.fn(() => ['items']);
    props = getProvidedProps({items, transformItems}, {hitsPerPage: '10'});
    expect(transformItems.mock.calls[0][0]).toEqual(
      [{label: '10', value: 10, isRefined: true}, {label: '20', value: 20, isRefined: false}]
    );
    expect(props.items).toEqual(['items']);
  });

  it('calling refine updates the widget\'s search state', () => {
    const nextState = refine({}, {otherKey: 'val'}, 30);
    expect(nextState).toEqual({
      otherKey: 'val',
      hitsPerPage: 30,
    });
  });

  it('refines the hitsPerPage parameter', () => {
    const sp = new SearchParameters();

    params = getSP(sp, {}, {hitsPerPage: 10});
    expect(params).toEqual(sp.setQueryParameter('hitsPerPage', 10));

    params = getSP(sp, {}, {hitsPerPage: '10'});
    expect(params).toEqual(sp.setQueryParameter('hitsPerPage', 10));

    params = getSP(sp, {defaultRefinement: 20}, {});
    expect(params).toEqual(sp.setQueryParameter('hitsPerPage', 20));
  });

  it('registers its id in metadata', () => {
    const metadata = getMetadata({});
    expect(metadata).toEqual({id: 'hitsPerPage'});
  });

  it('should return the right searchState when clean up', () => {
    const searchState = cleanUp({}, {
      hitsPerPage: {searchState: 'searchState'},
      another: {searchState: 'searchState'},
    });
    expect(searchState).toEqual({another: {searchState: 'searchState'}});
  });
});
