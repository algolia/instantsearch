/* eslint-env jest, jasmine */

import connect from './connect';
jest.mock('../../core/createConnector');

const {getProps} = connect;

let props;
describe('PoweredBy.connect', () => {
  it('provides the correct props to the component', () => {
    props = getProps();
    expect(props).toEqual({url: 'https://www.algolia.com/?utm_source=instantsearch.js&utm_medium=website&utm_content=&utm_campaign=poweredby'});
  });
});
