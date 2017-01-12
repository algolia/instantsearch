/* eslint-env jest, jasmine */
import {SearchParameters} from 'algoliasearch-helper';

import connect from './connectConfigure.js';
jest.mock('../core/createConnector');

const {getSearchParameters} = connect;

describe('connectConfigure', () => {
  it('it propagates the props to the SearchParameters without children', () => {
    const searchParameters = getSearchParameters(
      new SearchParameters(),
      {distinct: 1, whatever: 'please', children: 'whatever'}
    );
    expect(searchParameters.getQueryParameter('distinct')).toEqual(1);
    expect(searchParameters.getQueryParameter('whatever')).toEqual('please');
    expect(searchParameters.getQueryParameter.bind(searchParameters, 'children')).toThrow();
  });
});
