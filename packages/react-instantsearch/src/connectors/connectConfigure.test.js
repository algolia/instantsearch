/* eslint-env jest, jasmine */
import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectConfigure.js';
jest.mock('../core/createConnector');

const {getSearchParameters, transitionState, cleanUp} = connect;

describe('connectConfigure', () => {
  it('it propagates the props to the SearchParameters without children', () => {
    const searchParameters = getSearchParameters(
      new SearchParameters(),
      {distinct: 1, whatever: 'please', children: 'whatever'},
      {}
    );
    expect(searchParameters.getQueryParameter('distinct')).toEqual(1);
    expect(searchParameters.getQueryParameter('whatever')).toEqual('please');
    expect(searchParameters.getQueryParameter.bind(searchParameters, 'children')).toThrow();
  });

  it('configure parameters that are in the search state should override the default one', () => {
    const searchParameters = getSearchParameters(
      new SearchParameters(),
      {distinct: 1, whatever: 'please', children: 'whatever'},
      {configure: {whatever: 'priority'}}
    );
    expect(searchParameters.getQueryParameter('distinct')).toEqual(1);
    expect(searchParameters.getQueryParameter('whatever')).toEqual('priority');
    expect(searchParameters.getQueryParameter.bind(searchParameters, 'children')).toThrow();
  });

  it('calling transitionState should add configure parameters to the search state', () => {
    let searchState = transitionState(
      {distinct: 1, whatever: 'please', children: 'whatever'},
      {},
      {}
    );
    expect(searchState).toEqual({configure: {distinct: 1, whatever: 'please'}});

    searchState = transitionState(
      {distinct: 1, whatever: 'please', children: 'whatever'},
      {configure: {distinct: 1, whatever: 'please'}},
      {configure: {distinct: 1, whatever: 'whatever'}},
    );
    expect(searchState).toEqual({configure: {distinct: 1, whatever: 'whatever'}});
  });

  it('calling cleanUp should remove configure parameters from the search state', () => {
    let searchState = cleanUp(
      {distinct: 1, whatever: 'please', children: 'whatever'},
      {configure: {distinct: 1, whatever: 'please', another: 'parameters'}}
    );
    expect(searchState).toEqual({configure: {another: 'parameters'}});

    searchState = cleanUp(
      {distinct: 1, whatever: 'please', children: 'whatever'},
      {configure: {distinct: 1, whatever: 'please'}}
    );
    expect(searchState).toEqual({});
  });
});
