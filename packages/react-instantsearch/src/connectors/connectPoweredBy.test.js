/* eslint-env jest, jasmine */

import connect from './connectPoweredBy';
jest.mock('../core/createConnector');

const {getProvidedProps} = connect;

let props;
describe('connectPoweredBy', () => {
  it('provides the correct props to the component', () => {
    props = getProvidedProps();
    expect(props).toEqual({url: 'https://www.algolia.com/?utm_source=instantsearch.js&utm_medium=website&utm_content=&utm_campaign=poweredby'});
  });
});
